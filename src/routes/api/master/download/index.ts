import { createFileRoute } from "@tanstack/react-router";
import { and, eq, notExists } from "drizzle-orm";
import * as XLSX from "xlsx";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { customUser, events, registrations, workshops } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * Unified master user-data download endpoint.
 * GET /api/master/download?type=users|event|workshop|inactive-users[&id=<n>]
 */
export const Route = createFileRoute("/api/master/download/")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				// ── Auth ─────────────────────────────────────────────────────────
				const session = await auth.api.getSession({ headers: request.headers });
				if (!session) return new Response("Unauthorized", { status: 401 });

				const [dbUser] = await db
					.select({ role: user.role })
					.from(user)
					.where(eq(user.id, session.user.id))
					.limit(1);

				if (!dbUser?.role || !["MASTER", "ADMIN"].includes(dbUser.role)) {
					return new Response("Forbidden", { status: 403 });
				}

				// ── Params ───────────────────────────────────────────────────────
				const url = new URL(request.url);
				const type = url.searchParams.get("type");
				const idRaw = url.searchParams.get("id");
				const id = idRaw ? Number(idRaw) : null;

				const downloadedAt = new Date().toLocaleString("en-IN", {
					dateStyle: "medium",
					timeStyle: "short",
				});

				// ── Shared helpers ───────────────────────────────────────────────
				const USER_COLS = [30, 30, 24, 14, 28, 16, 8, 20].map((w) => ({
					wch: w,
				}));
				const USER_HEADERS = [
					"Synergy ID",
					"Email",
					"Full Name",
					"Phone",
					"College",
					"City",
					"Year",
					"Department",
				];

				type UserRow = {
					userId: string;
					synergyId: string | null;
					email: string;
					fullname: string | null;
					phone: string | null;
					college: string | null;
					city: string | null;
					year: string | null;
					department: string | null;
				};

				const toRow = (r: UserRow) => [
					r.synergyId ?? "",
					r.email,
					r.fullname ?? "",
					r.phone ?? "",
					r.college ?? "",
					r.city ?? "",
					r.year ?? "",
					r.department ?? "",
				];

				const buildXlsx = (
					heading: string,
					headers: string[],
					dataRows: unknown[][],
					cols: { wch: number }[],
					sheetName: string,
				): string => {
					const wb = XLSX.utils.book_new();
					const ws = XLSX.utils.aoa_to_sheet([]);
					XLSX.utils.sheet_add_aoa(ws, [[heading]], { origin: "A1" });
					XLSX.utils.sheet_add_aoa(ws, [[`Downloaded at: ${downloadedAt}`]], {
						origin: "A2",
					});
					XLSX.utils.sheet_add_aoa(ws, [[""]], { origin: "A3" });
					XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A4" });
					XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A5" });
					ws["!cols"] = cols;
					XLSX.utils.book_append_sheet(wb, ws, sheetName);
					// base64 string — universally safe to pass to Response via atob
					return XLSX.write(wb, { type: "base64", bookType: "xlsx" }) as string;
				};

				const respond = (b64: string, filename: string) => {
					const binary = atob(b64);
					const bytes = new Uint8Array(binary.length);
					for (let i = 0; i < binary.length; i++)
						bytes[i] = binary.charCodeAt(i);
					return new Response(bytes, {
						status: 200,
						headers: {
							"Content-Type":
								"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
							"Content-Disposition": `attachment; filename="${filename}"`,
						},
					});
				};

				// ── type = users ─────────────────────────────────────────────────
				if (type === "users") {
					const rows = await db
						.select({
							userId: user.id,
							synergyId: customUser.synergyId,
							email: user.email,
							fullname: customUser.fullname,
							phone: customUser.phone,
							college: customUser.college,
							city: customUser.city,
							year: customUser.year,
							department: customUser.department,
						})
						.from(user)
						.leftJoin(customUser, eq(user.id, customUser.userId));

					return respond(
						buildXlsx(
							"All Users",
							USER_HEADERS,
							rows.map(toRow),
							USER_COLS,
							"Users",
						),
						"all_users.xlsx",
					);
				}

				// ── type = event ─────────────────────────────────────────────────
				if (type === "event") {
					if (!id || Number.isNaN(id)) {
						return new Response("Missing or invalid id", { status: 400 });
					}

					const [eventRow] = await db
						.select({ title: events.title })
						.from(events)
						.where(eq(events.id, id))
						.limit(1);

					const rows = await db
						.select({
							userId: user.id,
							synergyId: customUser.synergyId,
							email: user.email,
							fullname: customUser.fullname,
							phone: customUser.phone,
							college: customUser.college,
							city: customUser.city,
							year: customUser.year,
							department: customUser.department,
						})
						.from(user)
						.leftJoin(customUser, eq(user.id, customUser.userId))
						.innerJoin(
							registrations,
							and(
								eq(user.id, registrations.userId),
								eq(registrations.eventId, id),
							),
						);

					const title = eventRow?.title ?? `Event ${id}`;
					return respond(
						buildXlsx(
							`${title} - Registered Users`,
							USER_HEADERS,
							rows.map(toRow),
							USER_COLS,
							"Registered Users",
						),
						`${title.replace(/\s+/g, "_")}_registered_users.xlsx`,
					);
				}

				// ── type = workshop ──────────────────────────────────────────────
				if (type === "workshop") {
					if (!id || Number.isNaN(id)) {
						return new Response("Missing or invalid id", { status: 400 });
					}

					const [workshopRow] = await db
						.select({ title: workshops.title })
						.from(workshops)
						.where(eq(workshops.id, id))
						.limit(1);

					const rows = await db
						.select({
							userId: user.id,
							synergyId: customUser.synergyId,
							email: user.email,
							fullname: customUser.fullname,
							phone: customUser.phone,
							college: customUser.college,
							city: customUser.city,
							year: customUser.year,
							department: customUser.department,
						})
						.from(user)
						.leftJoin(customUser, eq(user.id, customUser.userId))
						.innerJoin(
							registrations,
							and(
								eq(user.id, registrations.userId),
								eq(registrations.workshopId, id),
							),
						);

					const title = workshopRow?.title ?? `Workshop ${id}`;
					return respond(
						buildXlsx(
							`${title} - Registered Users`,
							USER_HEADERS,
							rows.map(toRow),
							USER_COLS,
							"Registered Users",
						),
						`${title.replace(/\s+/g, "_")}_registered_users.xlsx`,
					);
				}

				// ── type = inactive-users ────────────────────────────────────────
				if (type === "inactive-users") {
					const rows = await db
						.select({
							userId: user.id,
							synergyId: customUser.synergyId,
							email: user.email,
							fullname: customUser.fullname,
							phone: customUser.phone,
							college: customUser.college,
							city: customUser.city,
							year: customUser.year,
							department: customUser.department,
						})
						.from(customUser)
						.innerJoin(user, eq(customUser.userId, user.id))
						.where(
							notExists(
								db
									.select({ id: registrations.id })
									.from(registrations)
									.where(eq(registrations.userId, customUser.userId)),
							),
						);

					return respond(
						buildXlsx(
							"Inactive Users (Onboarded, Not Registered)",
							USER_HEADERS,
							rows.map(toRow),
							USER_COLS,
							"Inactive Users",
						),
						"inactive_users.xlsx",
					);
				}

				return new Response(
					"Invalid type. Use: users, event, workshop, inactive-users",
					{ status: 400 },
				);
			},
		},
	},
});
