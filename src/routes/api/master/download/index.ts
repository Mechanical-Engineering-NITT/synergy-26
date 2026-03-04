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
				const BASE_USER_COLS = [30, 30, 24, 14, 28, 16, 8, 20].map((w) => ({
					wch: w,
				}));
				const BASE_USER_HEADERS = [
					"Synergy ID",
					"Email",
					"Full Name",
					"Phone",
					"College",
					"City",
					"Year",
					"Department",
				];
				const ALL_USERS_COLS = [30, 30, 24, 14, 28, 16, 8, 20, 36, 36].map(
					(w) => ({
						wch: w,
					}),
				);
				const ALL_USERS_HEADERS = [
					...BASE_USER_HEADERS,
					"Registered Events",
					"Registered Workshops",
				];

				type BaseUserRow = {
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
				type AllUsersRow = BaseUserRow & {
					registeredEvents: string[];
					registeredWorkshops: string[];
				};

				const toBaseRow = (r: BaseUserRow) => [
					r.synergyId ?? "",
					r.email,
					r.fullname ?? "",
					r.phone ?? "",
					r.college ?? "",
					r.city ?? "",
					r.year ?? "",
					r.department ?? "",
				];

				const toAllUsersRow = (r: AllUsersRow) => [
					...toBaseRow(r),
					r.registeredEvents.join(", "),
					r.registeredWorkshops.join(", "),
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
							eventTitle: events.title,
							workshopTitle: workshops.title,
						})
						.from(user)
						.leftJoin(customUser, eq(user.id, customUser.userId))
						.leftJoin(registrations, eq(user.id, registrations.userId))
						.leftJoin(events, eq(registrations.eventId, events.id))
						.leftJoin(workshops, eq(registrations.workshopId, workshops.id));

					const allUsersMap = new Map<
						string,
						{
							userId: string;
							synergyId: string | null;
							email: string;
							fullname: string | null;
							phone: string | null;
							college: string | null;
							city: string | null;
							year: string | null;
							department: string | null;
							registeredEvents: Set<string>;
							registeredWorkshops: Set<string>;
						}
					>();

					for (const row of rows) {
						let currentUser = allUsersMap.get(row.userId);

						if (!currentUser) {
							currentUser = {
								userId: row.userId,
								synergyId: row.synergyId,
								email: row.email,
								fullname: row.fullname,
								phone: row.phone,
								college: row.college,
								city: row.city,
								year: row.year,
								department: row.department,
								registeredEvents: new Set<string>(),
								registeredWorkshops: new Set<string>(),
							};
							allUsersMap.set(row.userId, currentUser);
						}

						if (row.eventTitle) {
							currentUser.registeredEvents.add(row.eventTitle);
						}

						if (row.workshopTitle) {
							currentUser.registeredWorkshops.add(row.workshopTitle);
						}
					}

					const allUsersRows: AllUsersRow[] = Array.from(
						allUsersMap.values(),
					).map(
						({ registeredEvents, registeredWorkshops, ...currentUser }) => ({
							...currentUser,
							registeredEvents: Array.from(registeredEvents).sort((a, b) =>
								a.localeCompare(b),
							),
							registeredWorkshops: Array.from(registeredWorkshops).sort(
								(a, b) => a.localeCompare(b),
							),
						}),
					);

					return respond(
						buildXlsx(
							"All Users",
							ALL_USERS_HEADERS,
							allUsersRows.map(toAllUsersRow),
							ALL_USERS_COLS,
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
							BASE_USER_HEADERS,
							rows.map(toBaseRow),
							BASE_USER_COLS,
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
							BASE_USER_HEADERS,
							rows.map(toBaseRow),
							BASE_USER_COLS,
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
							BASE_USER_HEADERS,
							rows.map(toBaseRow),
							BASE_USER_COLS,
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
