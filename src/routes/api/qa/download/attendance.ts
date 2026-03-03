import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { attendance, customUser, sessions } from "@/db/schema";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/qa/download/attendance")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				const session = await auth.api.getSession({ headers: request.headers });
				if (!session) return new Response("Unauthorized", { status: 401 });
				const [dbUser] = await db
					.select({ role: user.role })
					.from(user)
					.where(eq(user.id, session.user.id))
					.limit(1);
				if (!dbUser?.role || !["QA", "MASTER", "ADMIN"].includes(dbUser.role)) {
					return new Response("Forbidden", { status: 403 });
				}

				const url = new URL(request.url);
				const type = url.searchParams.get("type") as
					| "event"
					| "workshop"
					| null;
				const idParam = url.searchParams.get("id");
				const sessionIdParam = url.searchParams.get("sessionId");

				if (!type || (type !== "event" && type !== "workshop")) {
					return new Response("Invalid type", { status: 400 });
				}
				const id = Number(idParam);
				if (Number.isNaN(id)) {
					return new Response("Invalid id", { status: 400 });
				}
				const sessionId = sessionIdParam ? Number(sessionIdParam) : null;

				const baseWhere =
					type === "event"
						? eq(attendance.eventId, id)
						: eq(attendance.workshopId, id);

				const whereClause =
					sessionId != null
						? and(baseWhere, eq(attendance.sessionId, sessionId))
						: baseWhere;

				const rows = await db
					.select({
						synergyId: customUser.synergyId,
						fullname: customUser.fullname,
						college: customUser.college,
						city: customUser.city,
						department: customUser.department,
						year: customUser.year,
						phone: customUser.phone,
						gender: customUser.gender,
						email: user.email,
						checkedInAt: attendance.createdAt,
					})
					.from(attendance)
					.innerJoin(user, eq(attendance.userId, user.id))
					.innerJoin(customUser, eq(user.id, customUser.userId))
					.where(whereClause)
					.orderBy(attendance.createdAt);

				// Deduplicate for "All" view
				const deduped =
					sessionId == null
						? rows.filter((r, idx, arr) => {
								const key = r.synergyId ?? r.email;
								return (
									arr.findIndex((x) => (x.synergyId ?? x.email) === key) === idx
								);
							})
						: rows;

				// Get session name for the title
				let sessionName = "All Sessions";
				if (sessionId != null) {
					const [sess] = await db
						.select({ name: sessions.name })
						.from(sessions)
						.where(eq(sessions.id, sessionId))
						.limit(1);
					sessionName = sess?.name ?? "Session";
				}

				const titleParam = url.searchParams.get("title") ?? `${type} ${id}`;
				const downloadedAt = new Date().toLocaleString("en-IN", {
					dateStyle: "medium",
					timeStyle: "short",
				});

				const wb = XLSX.utils.book_new();
				const ws = XLSX.utils.aoa_to_sheet([]);

				XLSX.utils.sheet_add_aoa(
					ws,
					[[`${titleParam} - Attendance (${sessionName})`]],
					{ origin: "A1" },
				);
				XLSX.utils.sheet_add_aoa(ws, [[`Downloaded at: ${downloadedAt}`]], {
					origin: "A2",
				});
				XLSX.utils.sheet_add_aoa(ws, [[""]], { origin: "A3" });
				XLSX.utils.sheet_add_aoa(
					ws,
					[
						[
							"Synergy ID",
							"Full Name",
							"Email",
							"College",
							"City",
							"Department",
							"Year",
							"Phone",
							"Gender",
							"Checked In At",
						],
					],
					{ origin: "A4" },
				);
				XLSX.utils.sheet_add_aoa(
					ws,
					deduped.map((r) => [
						r.synergyId ?? "",
						r.fullname,
						r.email,
						r.college,
						r.city,
						r.department,
						r.year,
						r.phone,
						r.gender,
						new Date(r.checkedInAt).toLocaleString("en-IN"),
					]),
					{ origin: "A5" },
				);

				ws["!cols"] = [14, 24, 30, 28, 16, 20, 8, 14, 10, 22].map((w) => ({
					wch: w,
				}));
				XLSX.utils.book_append_sheet(wb, ws, "Attendance");
				const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

				const filename = `${titleParam.replace(/\s+/g, "_")}_${sessionName.replace(/\s+/g, "_")}_attendance.xlsx`;
				return new Response(buf, {
					status: 200,
					headers: {
						"Content-Type":
							"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
						"Content-Disposition": `attachment; filename="${filename}"`,
					},
				});
			},
		},
	},
});
