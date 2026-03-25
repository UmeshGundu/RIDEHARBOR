// ── Sidebar Controller ─────────────────────────────────────────────────────
class SidebarController {
    constructor() {
        this.sidebar = document.getElementById("sidebar");
        this.overlay = document.getElementById("sidebarOverlay");
        this.overlay.addEventListener("click", () => this.close());
    }

    open() {
        this.sidebar.classList.add("open");
        this.overlay.classList.add("visible");
    }

    close() {
        this.sidebar.classList.remove("open");
        this.overlay.classList.remove("visible");
    }
}


// ── Summary Cards Controller ───────────────────────────────────────────────
class SummaryController {
    constructor() {
        this.sectionEl = document.getElementById("currentSection");
        this.totalEl = document.getElementById("totalRecords");
        this.badgeEl = document.getElementById("recordBadge");
        this.titleEl = document.getElementById("tableTitle");
        this.timestampEl = document.getElementById("footerTimestamp");
    }

    update(section, count) {
        this.sectionEl.innerText = section;
        this.totalEl.innerText = count;
        this.badgeEl.innerText = count;
        this.titleEl.innerText = section === "Users" ? "Registered Users" : "Instant Bookings";
        this.timestampEl.innerText = "Updated " + new Date().toLocaleTimeString();
    }
}


// ── Table Renderer ─────────────────────────────────────────────────────────
class TableRenderer {
    constructor(tableId) {
        this.table = document.getElementById(tableId);
        this.thead = this.table.querySelector("thead");
        this.tbody = this.table.querySelector("tbody");
        this.cardsEl = document.getElementById("dataCards");
        this.isMobile = () => window.innerWidth <= 560;
    }

    renderHeaders(columns) {
        this.thead.innerHTML =
            `<tr>${columns.map(c => `<th>${c}</th>`).join("")}</tr>`;
    }

    renderRows(rows, section) {
        this._renderTableRows(rows, section);
        // Always render both — CSS media queries control which is visible
        this._renderTableRows(rows);
        this._renderCards(rows, section);

        // Only override inline display on resize — not at load
        // Let CSS handle the show/hide via media queries
        this.cardsEl.style.display = "";
        this.table.closest(".table-container").style.display = "";
    }

    _renderTableRows(rows, section) {
        const isBookings = section === "Bookings";

        this.tbody.innerHTML = rows.length === 0
            ? `<tr><td colspan="${isBookings ? 14 : 4}" class="empty-state">No records found</td></tr>`
            : rows.map(row => `
            <tr>
                ${row.map(cell =>
                cell.isAction
                    ? `<td style="text-align:center">
                               <button class="delete-btn"
                                   data-id="${cell.val}"
                                   data-section="${section}">
                                   Delete
                               </button>
                           </td>`
                    : `<td class="${cell.cls || ""}">${cell.val}</td>`
            ).join("")}
            </tr>`
            ).join("");

        // Bind after render
        this.tbody.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () =>
                this.#handleDelete(btn.dataset.id, btn.dataset.section, btn.closest("tr"))
            );
        });
    }

    _renderCards(rows, section) {
        if (rows.length === 0) {
            this.cardsEl.innerHTML =
                `<div class="data-card"><p class="empty-state">No records found</p></div>`;
            return;
        }

        this.cardsEl.innerHTML = rows.map(row => {
            if (section === "Users") {
                const [id, username, mobile, otp] = row;
                return `
            <div class="data-card" data-id="${id.val}">
                <div class="data-card-header">
                    <div>
                        <div class="data-card-name">${username.val}</div>
                        <div class="data-card-id">#${id.val}</div>
                    </div>
                    <div class="data-card-badge">${otp.val}</div>
                </div>
                <div class="data-card-grid">
                    <div class="data-card-field">
                        <div class="data-card-label">Mobile</div>
                        <div class="data-card-value">${mobile.val}</div>
                    </div>
                    <div class="data-card-field">
                        <div class="data-card-label">OTP</div>
                        <div class="data-card-value" style="color:var(--gold);font-family:'Space Mono',monospace;letter-spacing:2px">${otp.val}</div>
                    </div>
                </div>
            </div>`;
            } else {
                const [id, name, email, mobile, car, location, journeyDate, licenseNo, duration, pickup, ret, amount, txn] = row;
                return `
            <div class="data-card" data-id="${id.val}">
                <div class="data-card-header">
                    <div>
                        <div class="data-card-name">${name.val}</div>
                        <div class="data-card-id">#${id.val} · ${car.val}</div>
                    </div>
                    <div class="data-card-badge">${amount.val}</div>
                </div>
                <div class="data-card-grid">
                    <div class="data-card-field">
                        <div class="data-card-label">Mobile</div>
                        <div class="data-card-value">${mobile.val}</div>
                    </div>
                    <div class="data-card-field">
                        <div class="data-card-label">Location</div>
                        <div class="data-card-value">${location.val}</div>
                    </div>
                    <div class="data-card-field">
                        <div class="data-card-label">Journey Date</div>
                        <div class="data-card-value">${journeyDate.val}</div>
                    </div>
                    <div class="data-card-field">
                        <div class="data-card-label">License No</div>
                        <div class="data-card-value">${licenseNo.val}</div>
                    </div>
                    <div class="data-card-field">
                        <div class="data-card-label">Duration</div>
                        <div class="data-card-value">${duration.val}</div>
                    </div>
                    <div class="data-card-field">
                        <div class="data-card-label">Pickup</div>
                        <div class="data-card-value">${pickup.val}</div>
                    </div>
                    <div class="data-card-field">
                        <div class="data-card-label">Return</div>
                        <div class="data-card-value">${ret.val}</div>
                    </div>
                    <div class="data-card-field" style="grid-column:1/-1">
                        <div class="data-card-label">Txn ID</div>
                        <div class="data-card-value" style="font-family:'Space Mono',monospace;font-size:11px;color:var(--text-muted)">${txn.val}</div>
                    </div>
                </div>
                <button class="delete-btn card-delete-btn" data-id="${id.val}" data-section="${section}">
                    Delete Record
                </button>
            </div>`;
            }
        }).join("");

        // Bind delete buttons on cards
        this.cardsEl.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () =>
                this.#handleDelete(btn.dataset.id, btn.dataset.section, btn.closest(".data-card"))
            );
        });
    }

    async #handleDelete(id, section, rowEl) {
        if (!confirm(`Delete record #${id}? This cannot be undone.`)) return;

        const endpoint = section === "Bookings"
            ? `http://localhost:8080/bookings/${id}`
            : `http://localhost:8080/api/auth/users/${id}`;

        try {
            const res = await fetch(endpoint, { method: "DELETE" });
            if (!res.ok) throw new Error(`Server error ${res.status}`);

            rowEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            rowEl.style.opacity = "0";
            rowEl.style.transform = "translateX(12px)";

            setTimeout(() => {
                rowEl.remove();

                // Remove matching card too (if exists)
                const matchingCard = this.cardsEl.querySelector(`.data-card[data-id="${id}"]`);
                if (matchingCard) matchingCard.remove();

                // Count from table rows only (source of truth)
                const count = this.tbody.querySelectorAll("tr").length;
                document.getElementById("totalRecords").innerText = count;
                document.getElementById("recordBadge").innerText = count;
            }, 300);

        } catch (err) {
            alert(`Failed to delete record #${id}. Please try again.`);
            console.error(err);
        }
    }

    renderError(colspan, message) {
        this.thead.innerHTML = "";
        this.tbody.innerHTML =
            `<tr><td colspan="${colspan}" class="empty-state">${message}</td></tr>`;
        this.cardsEl.innerHTML =
            `<div class="data-card"><p class="empty-state">${message}</p></div>`;
    }

    renderLoading(colspan) {
        this.tbody.innerHTML =
            `<tr><td colspan="${colspan}" class="empty-state">Loading…</td></tr>`;
        this.cardsEl.innerHTML =
            `<div class="data-card"><p class="empty-state">Loading…</p></div>`;
    }

    #emptyState(colspan) {
        return `<tr><td colspan="${colspan}" class="empty-state">No records found</td></tr>`;
    }

    filterRows(query) {
        const q = query.toLowerCase();
        // Filter table rows
        this.tbody.querySelectorAll("tr").forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(q) ? "" : "none";
        });
        // Filter cards
        this.cardsEl.querySelectorAll(".data-card").forEach(card => {
            card.style.display = card.innerText.toLowerCase().includes(q) ? "" : "none";
        });
    }
}


// ── API Service ────────────────────────────────────────────────────────────
class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async get(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return response.json();
    }
}


// ── Base Section (abstract-like) ───────────────────────────────────────────
class BaseSection {
    constructor(renderer, summary, apiService) {
        this.renderer = renderer;
        this.summary = summary;
        this.apiService = apiService;
    }

    get sectionName() { return ""; }
    get endpoint() { return ""; }
    get columns() { return []; }
    get errorColspan() { return 4; }

    mapRow(item) { return []; }   // override in subclass

    async load() {
        this.renderer.renderLoading(this.errorColspan);
        try {
            const data = await this.apiService.get(this.endpoint);
            this.summary.update(this.sectionName, data.length);
            this.renderer.renderHeaders(this.columns);
            this.renderer.renderRows(data.map((item, index) => this.mapRow(item, index)), this.sectionName);
        } catch (error) {
            console.error(`[${this.sectionName}] Load failed:`, error);
            this.renderer.renderError(this.errorColspan, `Failed to load ${this.sectionName.toLowerCase()} data`);
        }
    }
}


// ── Users Section ──────────────────────────────────────────────────────────
class UsersSection extends BaseSection {
    get sectionName() { return "Users"; }
    get endpoint() { return "/api/auth/users"; }
    get errorColspan() { return 4; }
    get columns() { return ["S.No", "Username", "Mobile Number", "OTP"]; }

    mapRow(user, index) {
        return [
            { val: index + 1 },
            { val: user.username },
            { val: user.mobileNumber },
            { val: user.otp, cls: "otp-cell" },
        ];
    }
}


// ── Bookings Section ───────────────────────────────────────────────────────
class BookingsSection extends BaseSection {
    get sectionName() { return "Bookings"; }
    get endpoint() { return "/bookings"; }
    get errorColspan() { return 14; }
    get columns() {
        return [
            "S.No", "Name", "Email", "Mobile", "Car",
            "Location", "Journey Date", "License No",
            "Duration", "Pickup", "Return", "Amount", "Txn ID", "Action"
        ];
    }

    mapRow(b, index) {
        return [
            { val: index + 1 },
            { val: b.name ?? "—" },
            { val: b.email ?? "—" },
            { val: b.mobile ?? "—" },
            { val: b.car ?? "—" },
            { val: b.location ?? "—" },
            { val: b.journeyDate ?? "—" },
            { val: b.licenseNumber ?? "—" },
            { val: b.duration ?? "N/A" },
            { val: b.pickupTime ?? "N/A" },
            { val: b.returnTime ?? "N/A" },
            { val: `₹${b.amount ?? "—"}`, cls: "amount-cell" },
            { val: b.transactionId ?? "—" },
            { val: b.id, cls: "action-cell", isAction: true },
        ];
    }
}


// ── Navigation Controller ──────────────────────────────────────────────────
class NavController {
    constructor(buttons) {
        // buttons: { id, section }[]
        this.buttons = buttons;
    }

    setActive(activeId) {
        this.buttons.forEach(({ id }) => {
            document.getElementById(id).classList.toggle("active", id === activeId);
        });
    }
}


// ── Search Controller ──────────────────────────────────────────────────────
class SearchController {
    constructor(inputId, renderer) {
        this.input = document.getElementById(inputId);
        this.renderer = renderer;
        this.input.addEventListener("keyup", () => this.renderer.filterRows(this.input.value));
    }

    reset() {
        this.input.value = "";
    }
}


// ── Admin Dashboard (Orchestrator) ─────────────────────────────────────────
class AdminDashboard {
    constructor() {
        const api = new ApiService("http://localhost:8080");
        const renderer = new TableRenderer("dataTable");
        const summary = new SummaryController();

        this.sidebar = new SidebarController();
        this.nav = new NavController([
            { id: "usersBtn" },
            { id: "bookingsBtn" },
        ]);
        this.search = new SearchController("searchInput", renderer);

        this.sections = {
            users: new UsersSection(renderer, summary, api),
            bookings: new BookingsSection(renderer, summary, api),
        };

        this.#bindEvents();
        this.#loadSection("users", "usersBtn");
    }

    #bindEvents() {
        document.getElementById("usersBtn").addEventListener("click", () => {
            this.sidebar.close();
            this.#loadSection("users", "usersBtn");
        });

        document.getElementById("bookingsBtn").addEventListener("click", () => {
            this.sidebar.close();
            this.#loadSection("bookings", "bookingsBtn");
        });

        document.getElementById("hamburgerBtn").addEventListener("click", () => {
            this.sidebar.open();
        });
    }

    #loadSection(key, btnId) {
        this.nav.setActive(btnId);
        this.search.reset();
        this.sections[key].load();
    }
}


// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => new AdminDashboard());