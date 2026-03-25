// =============================================
// Toast Notification
// =============================================
class Toast {
    constructor() {
        this.defaultDuration = 3500;
    }
    show(message, type = "info", duration = this.defaultDuration) {
        this.remove();
        this.toast = document.createElement("div");
        this.toast.className = `toast ${type}`;
        this.toast.innerText = message;
        document.body.appendChild(this.toast);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.toast.classList.add("show");
            });
        });
        this.timer = setTimeout(() => this.hide(), duration);
    }
    hide() {
        if (!this.toast) return;
        this.toast.classList.remove("show");
        setTimeout(() => this.remove(), 400);
    }
    remove() {
        if (this.timer) clearTimeout(this.timer);
        const existing = document.querySelector(".toast");
        if (existing) existing.remove();
        this.toast = null;
    }
    success(message, duration) { this.show(message, "success", duration); }
    error(message, duration) { this.show(message, "error", duration); }
    info(message, duration) { this.show(message, "info", duration); }
}
const toast = new Toast();
//Preloader ======================
class Preloader {
    constructor(preloaderId, delayTime) {
        this.preloader = document.getElementById(preloaderId);
        this.delayTime = delayTime;
    }
    hidePreloader() {
        this.preloader.classList.add("hide");
    }
    start() {
        // Check if already shown in this session
        if (sessionStorage.getItem("preloaderShown")) {
            this.hidePreloader();   // hide immediately
            return;
        }
        window.addEventListener("load", () => {
            setTimeout(() => {
                sessionStorage.setItem("preloaderShown", "true");
                this.hidePreloader();
            }, this.delayTime);
        });
    }
}
const isMobile = window.innerWidth <= 560;
const appPreloader = new Preloader("preloader", isMobile ? 3800 : 5000);
appPreloader.start();
//LogoSlider Class ======================================= 
class LogoSlider {
    constructor(selector, intervalTime, viewModel) {
        this.logos = document.querySelectorAll(selector);
        this.currentIndex = 0;
        this.intervalTime = intervalTime;
        this.viewModel = document.querySelector(viewModel);
        this.modelPages = [
            "lamborghini.html",
            "mercedes.html",
            "audi.html",
            "bmw.html",
            "rollsroyce.html",
            "porsche.html",
            "lexus.html"
        ];
        this.start();
    }
    start() {
        this.updateSlider();
        setInterval(() => {
            this.next();
        }, this.intervalTime);
    }
    next() {
        this.currentIndex++;
        if (this.currentIndex >= this.logos.length) {
            this.currentIndex = 0;
        }
        this.updateSlider();
    }
    updateSlider() {
        this.logos.forEach((logo) => {    // Remove all position classes first
            logo.classList.remove("centerPosition", "leftPosition", "rightPosition", "hidelogo");
        });
        this.logos[this.currentIndex].classList.add("centerPosition");
        let previousIndex = this.currentIndex - 1;
        if (previousIndex < 0) {
            previousIndex = this.logos.length - 1;
        }
        this.logos[previousIndex].classList.add("leftPosition");
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.logos.length) {
            nextIndex = 0;
        }
        this.logos[nextIndex].classList.add("rightPosition");
        this.logos.forEach((logo, index) => {
            if (
                index !== this.currentIndex &&
                index !== previousIndex &&
                index !== nextIndex
            ) {
                logo.classList.add("hidelogo");
            }
        });
        // Update link
        this.viewModel.href = this.modelPages[this.currentIndex];
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new LogoSlider(".logo-card", 3500, "#viewmodel");
});
//Instant Booking Manager ======================================= 
class BookingManager {
    constructor(buttonId) {
        this.reserveButton = document.getElementById(buttonId);
        this.bookingModal = document.getElementById("bookingModal");
        this.init();
    }
    init() {
        if (!this.reserveButton) {
            console.error("Reserve button not found");
            return;
        }
        this.reserveButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.handleBooking();
        });
    }
    handleBooking() {
        const data = this.collectBookingData();
        if (!data) return;

        // ✅ POST to /payment instead of /bookings so bookingType + transactionId are saved
        fetch("http://localhost:8080/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(result => {
                // ✅ Save transactionId + booking time for edit-window tracking (same as BookingAPI)
                localStorage.setItem("transactionId", result.transactionId);
                const times = JSON.parse(localStorage.getItem("bookingTimes") || "{}");
                times[result.transactionId] = new Date().toISOString();
                localStorage.setItem("bookingTimes", JSON.stringify(times));

                toast.success("Details saved! Proceed to confirm your booking.", 3000);

                if (this.bookingModal) {
                    setTimeout(() => {
                        this.bookingModal.style.display = "flex";
                    }, 800);
                }
            })
            .catch(() => {
                toast.error("Failed to save booking");
            });
    }

    collectBookingData() {
        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const location = document.getElementById("pickupLocation").value.trim();
        const car = document.getElementById("carSelect").value;
        const duration = document.getElementById("durationSelect").value;
        const pickupTime = document.getElementById("pickupTime").value;

        // Always use logged-in user's mobile — ignore the form's mobile field
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
        const mobile = loggedInUser ? loggedInUser.mobile : document.getElementById("mobileNumber").value.trim();

        if (!name) { toast.info("Please enter your full name."); return null; }
        if (!mobile) { toast.info("Please enter your mobile number."); return null; }
        if (!email) { toast.info("Please enter your email."); return null; }
        if (!location) { toast.info("Please enter your pickup location."); return null; }
        if (car === "Choose Car") { toast.info("Please select a car."); return null; }
        if (duration === "Duration") { toast.info("Please select a rental duration."); return null; }
        if (!pickupTime) { toast.info("Please select a pickup time."); return null; }

        const returnTime = this.calculateReturnTime(pickupTime, duration);

        return {
            name,
            mobile,   // ← always the logged-in user's mobile
            email,
            location,
            car,
            duration,
            pickupTime,
            returnTime,
            bookingType: "INSTANT"
        };
    }
    isTodayBooking() {
        // you don’t have date now, so treat all as instant for now
        // later you can compare selected date
        return true;
    }
    calculateReturnTime(pickupTime, duration) {
        const hours = parseInt(duration); // "4 Hours" -> 4
        const [h, m] = pickupTime.split(":").map(Number);
        const date = new Date();
        date.setHours(h);
        date.setMinutes(m);
        date.setHours(date.getHours() + hours);
        const rh = String(date.getHours()).padStart(2, "0");
        const rm = String(date.getMinutes()).padStart(2, "0");
        return `${rh}:${rm}`;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new BookingManager("reserveBtn");
});
// Proceed to Payment Page
document.addEventListener("DOMContentLoaded", () => {
    const proceedButton = document.getElementById("proceedPayment");
    if (proceedButton) {
        proceedButton.addEventListener("click", () => {

            toast.success("Booking Confirmed! Redirecting to payment... ✅", 2000);

            setTimeout(() => {

                // ✅ GET DATA FROM FORM (CORRECT WAY)
                const bookingData = {
                    name: document.getElementById("fullName").value,
                    mobile: document.getElementById("mobileNumber").value,
                    email: document.getElementById("email").value,
                    location: document.getElementById("pickupLocation").value,
                    car: document.getElementById("carSelect").value,
                    duration: document.getElementById("durationSelect").value,
                    pickupTime: document.getElementById("pickupTime").value,
                    returnTime: "" // optional
                };

                console.log("Booking Data:", bookingData); // 🔍 DEBUG

                // ✅ SAVE DATA
                localStorage.setItem("bookingData", JSON.stringify(bookingData));

                // ✅ REDIRECT
                window.location.href = "payment.html";

            }, 1500);
        });
    }
});
// class PaymentNavigation {
//     constructor(buttonId) {
//         this.button = document.getElementById(buttonId);
//         this.initialize();
//     }
//     initialize() {
//         if (!this.button) {
//             console.error("Proceed Payment button not found");
//             return;
//         }
//         this.button.addEventListener("click", () => {
//             toast.success("Booking Confirmed! Redirecting to payment... ✅", 2000);
//             setTimeout(() => {
//                 window.location.href = "payment.html";
//             }, 1500);
//         });
//     }
// }
// document.addEventListener("DOMContentLoaded", () => {
//     new PaymentNavigation("proceedPayment");
// });
// ===================================
class ModalController {
    constructor(closeBtnId, modalId) {
        this.closeBtn = document.getElementById(closeBtnId);
        this.modal = document.getElementById(modalId);
        this.initialize();
    }
    initialize() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => {
                this.modal.style.display = "none";
            });
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new ModalController("closeBooking", "bookingModal");
});
// =========================================
// LoginSystem — Split modal: Sign Up | Login
// =========================================
class LoginSystem {
    constructor() {
        this.loggedIn = false;
        this.currentUser = null;
        this.editTimers = {};

        this.loginModal = document.getElementById("loginModal");
        this.closeLogin = document.getElementById("closeLogin");
        this.signupBtn = document.getElementById("signupBtn");
        this.signupMobileInput = document.getElementById("signupMobileInput");
        this.usernameInput = document.getElementById("usernameInput");
        this.signupOtpSection = document.getElementById("signupOtpSection");
        this.signupOtpInput = document.getElementById("signupOtpInput");
        this.signupVerifyOtpBtn = document.getElementById("signupVerifyOtpBtn");
        this.loginContinueBtn = document.getElementById("loginContinueBtn");
        this.loginMobileInput = document.getElementById("loginMobileInput");
        this.profileBtn = document.querySelector(".signin a");
        this.mobileProfileIcon = document.querySelector(".signin");
        this.profileModal = document.getElementById("profileModal");
        this.closeProfileBtn = document.getElementById("closeProfile");
        this.logoutBtn = document.getElementById("logoutBtn");
        this.goldButtons = document.querySelectorAll(".gold-btn");

        // Edit modal
        this.editModal = document.getElementById("editBookingModal");
        this.closeEditBtn = document.getElementById("closeEditBooking");
        this.saveEditBtn = document.getElementById("saveEditBooking");

        // Restore session
        const saved = localStorage.getItem("user");
        if (saved) {
            const u = JSON.parse(saved);
            this.loggedIn = true;
            this.currentUser = u;
            if (this.profileBtn) this.profileBtn.innerText = "Profile";
            if (this.mobileProfileIcon) this.mobileProfileIcon.classList.add("logged-in");
        }

        this.initializeEvents();
    }

    initializeEvents() {
        if (this.closeLogin) this.closeLogin.onclick = () => this.closeLoginModal();
        if (this.signupBtn) this.signupBtn.onclick = () => this.handleSignup();
        if (this.signupVerifyOtpBtn) this.signupVerifyOtpBtn.onclick = () => this.verifySignupOtp();
        if (this.loginContinueBtn) this.loginContinueBtn.onclick = () => this.handleLoginContinue();
        if (this.closeProfileBtn) this.closeProfileBtn.onclick = () => this.closeProfile();
        if (this.logoutBtn) this.logoutBtn.onclick = () => this.handleLogout();
        if (this.closeEditBtn) this.closeEditBtn.onclick = () => this.editModal.style.display = "none";
        if (this.saveEditBtn) this.saveEditBtn.onclick = () => this.saveEditedBooking();

        if (this.profileBtn) {
            this.profileBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.handleProfileClick();
            });
        }
        if (this.mobileProfileIcon) {
            this.mobileProfileIcon.addEventListener("click", () => this.handleProfileClick());
        }

        this.goldButtons.forEach(btn => {
            btn.addEventListener("click", () => this.handleGoldButton(btn));
        });

        if (this.signupMobileInput) {
            this.signupMobileInput.addEventListener("input", () => {
                this.signupMobileInput.value = this.signupMobileInput.value.replace(/\D/g, "").slice(0, 10);
            });
        }
        if (this.loginMobileInput) {
            this.loginMobileInput.addEventListener("input", () => {
                this.loginMobileInput.value = this.loginMobileInput.value.replace(/\D/g, "").slice(0, 10);
            });
        }
        if (this.signupOtpInput) {
            this.signupOtpInput.addEventListener("input", () => {
                this.signupOtpInput.value = this.signupOtpInput.value.replace(/\D/g, "").slice(0, 6);
            });
        }

        // Close profile on backdrop click (outside inner)
        if (this.profileModal) {
            this.profileModal.addEventListener("click", (e) => {
                if (e.target === this.profileModal) this.closeProfile();
            });
        }
    }

    async handleSignup() {
        const username = this.usernameInput.value.trim();
        const mobile = this.signupMobileInput.value.trim();
        if (!username) { toast.info("Please enter your full name."); return; }
        if (!this.isValidMobile(mobile)) { toast.info("Please enter a valid 10-digit mobile number."); return; }

        this.signupBtn.disabled = true;
        this.signupBtn.textContent = "Sending...";
        try {
            const res = await fetch("http://localhost:8080/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, mobileNumber: mobile })
            });
            await res.json();
            this.signupOtpSection.style.display = "block";
            toast.success("OTP sent to +91 " + mobile);
        } catch (err) {
            toast.error("Failed to send OTP. Please try again.");
        } finally {
            this.signupBtn.disabled = false;
            this.signupBtn.textContent = "Sign Up & Send OTP";
        }
    }

    async verifySignupOtp() {
        const username = this.usernameInput.value.trim();
        const mobile = this.signupMobileInput.value.trim();
        const otp = this.signupOtpInput.value.trim();
        if (!otp || otp.length < 6) { toast.info("Please enter the 6-digit OTP."); return; }

        this.signupVerifyOtpBtn.disabled = true;
        this.signupVerifyOtpBtn.textContent = "Verifying...";
        try {
            const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, mobileNumber: mobile, otp })
            });
            const data = await res.json();
            if (data.status === "success") {
                this.onLoginSuccess(username, mobile);
            } else {
                toast.error("Invalid OTP. Please try again.");
            }
        } catch (err) {
            toast.error("Verification failed. Please try again.");
        } finally {
            this.signupVerifyOtpBtn.disabled = false;
            this.signupVerifyOtpBtn.textContent = "Verify & Register";
        }
    }

    async handleLoginContinue() {
        const mobile = this.loginMobileInput.value.trim();
        if (!this.isValidMobile(mobile)) { toast.info("Please enter a valid 10-digit mobile number."); return; }

        this.loginContinueBtn.disabled = true;
        this.loginContinueBtn.textContent = "Checking...";
        try {
            const res = await fetch("http://localhost:8080/api/auth/check-mobile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobileNumber: mobile })
            });
            const data = await res.json();
            if (data.exists) {
                this.onLoginSuccess(data.username, mobile);
            } else {
                toast.error("Mobile number not registered. Please sign up first.");
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            this.loginContinueBtn.disabled = false;
            this.loginContinueBtn.textContent = "Continue";
        }
    }

    onLoginSuccess(username, mobile) {
        this.loggedIn = true;
        this.currentUser = { username, mobile };
        this.loginModal.style.display = "none";
        localStorage.setItem("user", JSON.stringify({ username, mobile }));
        if (this.profileBtn) this.profileBtn.innerText = "Profile";
        if (this.mobileProfileIcon) this.mobileProfileIcon.classList.add("logged-in");
        if (this.signupOtpSection) this.signupOtpSection.style.display = "none";
        if (this.signupOtpInput) this.signupOtpInput.value = "";
        toast.success("Welcome, " + username + "!");
    }

    handleLogout() {
        this.loggedIn = false;
        this.currentUser = null;
        localStorage.removeItem("user");
        if (this.profileBtn) this.profileBtn.innerText = "Sign In";
        if (this.mobileProfileIcon) this.mobileProfileIcon.classList.remove("logged-in");
        this.closeProfile();
        toast.success("Signed out successfully.");
    }

    closeLoginModal() { this.loginModal.style.display = "none"; }

    closeProfile() {
        this.profileModal.classList.remove("open");
        document.body.style.overflow = "";
    }

    isValidMobile(mobile) { return /^[6-9]\d{9}$/.test(mobile); }

    handleProfileClick() {
        if (!this.loggedIn) {
            this.loginModal.style.display = "flex";
            return;
        }
        this.openProfileModal();
    }

    async openProfileModal() {
        const u = this.currentUser;
        document.getElementById("profileName").innerText = u.username;
        document.getElementById("profileMobile").innerText = "+91 " + u.mobile;

        this.profileModal.classList.add("open");
        document.body.style.overflow = "hidden";

        // Load bookings
        document.getElementById("instantBookings").innerHTML = `<p class="no-bookings-msg" style="color:#555;">Loading...</p>`;
        document.getElementById("futureBookings").innerHTML = `<p class="no-bookings-msg" style="color:#555;">Loading...</p>`;

        try {
            const res = await fetch("http://localhost:8080/bookings");
            const all = await res.json();
            // Filter by this user's mobile
            const mine = all.filter(b => b.mobile === u.mobile);
            this.renderBookings(mine);
        } catch (err) {
            document.getElementById("instantBookings").innerHTML = `<p class="no-bookings-msg">Could not load bookings.</p>`;
            document.getElementById("futureBookings").innerHTML = `<p class="no-bookings-msg">Could not load bookings.</p>`;
        }
    }

    renderBookings(bookings) {
        const instantDiv = document.getElementById("instantBookings");
        const futureDiv = document.getElementById("futureBookings");

        // A booking is FUTURE only if it explicitly has a journeyDate AND bookingType is "FUTURE"
        // Everything else (INSTANT, null, undefined) falls into instant
        const instant = bookings.filter(b =>
            b.bookingType === "INSTANT" ||
            !b.journeyDate ||
            b.journeyDate.trim() === ""
        );
        const future = bookings.filter(b =>
            b.bookingType === "FUTURE" &&
            b.journeyDate &&
            b.journeyDate.trim() !== ""
        );

        instantDiv.innerHTML = instant.length ? "" : `<p class="no-bookings-msg">No instant bookings yet.</p>`;
        futureDiv.innerHTML = future.length ? "" : `<p class="no-bookings-msg">No scheduled bookings yet.</p>`;

        instant.forEach(b => instantDiv.appendChild(this.createBookingCard(b, "instant")));
        future.forEach(b => futureDiv.appendChild(this.createBookingCard(b, "future")));
    }

    createBookingCard(b, type) {
        const card = document.createElement("div");
        card.className = "booking-card-item";
        card.setAttribute("data-id", b.id);

        // Calculate edit window: bookingTime stored in localStorage keyed by transactionId
        // We'll use transactionId + stored timestamp
        const storedTimes = JSON.parse(localStorage.getItem("bookingTimes") || "{}");
        const bookedAt = storedTimes[b.transactionId] ? new Date(storedTimes[b.transactionId]) : null;
        const now = new Date();
        const elapsedMs = bookedAt ? (now - bookedAt) : Infinity;
        const canEdit = elapsedMs < 60 * 60 * 1000; // 60 minutes
        const remainingMs = canEdit ? (60 * 60 * 1000 - elapsedMs) : 0;

        const tagClass = type === "instant" ? "tag-instant" : "tag-future";
        const tagLabel = type === "instant" ? "Instant" : "Scheduled";

        //  <p>🕐 Pickup: <span>${b.pickupTime || "—"}</span></p>
        //  <p>🔁 Return: <span>${b.returnTime || "—"}</span></p>

        card.innerHTML = `
            <span class="booking-card-tag ${tagClass}">${tagLabel}</span>
            <h4>${b.car || "—"}</h4>
            <p><span>${b.location || "—"}</span></p>
           
            ${b.journeyDate ? `<p>Date: <span>${b.journeyDate}</span></p>` : ""}
            <p><span>${b.email || "—"}</span></p>
            <p>TXN: <span style="font-size:11px;color:#666;">${b.transactionId || "—"}</span></p>
            <div class="booking-edit-row">
                ${canEdit
                ? `<span class="edit-timer" id="timer-${b.id}"></span>
                       <button class="booking-edit-btn" onclick="window.__loginSystem.openEditModal(${b.id})">Edit</button>`
                : `<span class="edit-expired-msg">Edit window expired</span>`
            }
            </div>
        `;

        if (canEdit && bookedAt) {
            this.startCountdown(b.id, remainingMs);
        }

        return card;
    }

    startCountdown(bookingId, remainingMs) {
        const el = () => document.getElementById(`timer-${bookingId}`);
        const update = () => {
            const e = el();
            if (!e) return;
            const left = remainingMs - (Date.now() - startTime);
            if (left <= 0) {
                e.closest(".booking-card-item").querySelector(".booking-edit-btn").disabled = true;
                e.closest(".booking-card-item").querySelector(".booking-edit-btn").style.display = "none";
                e.outerHTML = `<span class="edit-expired-msg">Edit window expired</span>`;
                clearInterval(interval);
                return;
            }
            const mins = Math.floor(left / 60000);
            const secs = Math.floor((left % 60000) / 1000);
            e.textContent = `⏱ ${mins}m ${secs}s left`;
            if (left < 300000) e.classList.add("expiring"); // red under 5 mins
        };
        const startTime = Date.now();
        update();
        const interval = setInterval(update, 1000);
        this.editTimers[bookingId] = interval;
    }

    async openEditModal(id) {
        try {
            const res = await fetch(`http://localhost:8080/bookings`);
            const all = await res.json();
            const b = all.find(x => x.id === id);
            if (!b) { toast.error("Booking not found."); return; }

            document.getElementById("edit_id").value = b.id;
            document.getElementById("edit_name").value = b.name || "";
            document.getElementById("edit_mobile").value = b.mobile || "";
            document.getElementById("edit_location").value = b.location || "";
            document.getElementById("edit_date").value = b.journeyDate || "";
            await this.populateEditCarOptions(b.car);
            document.getElementById("edit_email").value = b.email || "";
            document.getElementById("edit_license").value = b.licenseNumber || "";

            this.editModal.style.display = "flex";
        } catch (err) {
            toast.error("Failed to load booking details.");
        }
    }
    async populateEditCarOptions(selectedCar) {
        const carSelect = document.getElementById("edit_car");
        const mobileTrigger = document.getElementById("editMobileCarTrigger");
        const carList = document.getElementById("carList"); // SAME modal
        const carPicker = document.getElementById("carPickerModal");

        try {
            const response = await fetch("/data/cars.json");
            const data = await response.json();

            // Desktop dropdown
            carSelect.innerHTML = '<option value="">Select Car</option>';

            data.cars.forEach(car => {
                const option = document.createElement("option");
                option.value = car;
                option.innerText = car;

                if (car === selectedCar) option.selected = true;

                carSelect.appendChild(option);
            });

            // Mobile label
            if (selectedCar) {
                document.getElementById("editMobileCarLabel").innerText = selectedCar;
            }

            // Mobile list (reuse same modal)
            carList.innerHTML = "";
            data.cars.forEach(car => {
                const div = document.createElement("div");
                div.className = "car-item";
                div.innerText = car;

                div.onclick = () => {
                    carSelect.value = car;
                    document.getElementById("editMobileCarLabel").innerText = car;
                    carPicker.classList.remove("active");
                };

                carList.appendChild(div);
            });

            // Open modal on mobile click
            if (mobileTrigger) {
                mobileTrigger.onclick = () => carPicker.classList.add("active");
            }

        } catch (error) {
            console.error("Failed to load cars");
        }
    }

    async saveEditedBooking() {
        const id = document.getElementById("edit_id").value;
        const updated = {
            name: document.getElementById("edit_name").value,
            mobile: document.getElementById("edit_mobile").value,
            location: document.getElementById("edit_location").value,
            journeyDate: document.getElementById("edit_date").value,
            car: document.getElementById("edit_car").value,
            email: document.getElementById("edit_email").value,
            licenseNumber: document.getElementById("edit_license").value,
        };
        try {
            await fetch(`http://localhost:8080/bookings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated)
            });
            toast.success("Booking updated successfully!");
            this.editModal.style.display = "none";
            // Refresh bookings list
            await this.openProfileModal();
        } catch (err) {
            toast.error("Failed to update booking.");
        }
    }

    handleGoldButton(btn) {
        if (btn.id === "proceedPayment" || btn.id === "submitBooking") return;
        if (!this.loggedIn) {
            this.loginModal.style.display = "flex";
        } else {
            document.getElementById("bookingFormModal").style.display = "flex";
            const user = this.currentUser;
            document.getElementById("bf_name").value = user.username;
            document.getElementById("bf_mobile").value = user.mobile;
            this.populateCarOptions();
        }
    }

    async populateCarOptions() {
        const carSelect = document.getElementById("bf_car");
        const mobileTrigger = document.getElementById("mobileCarTrigger");
        const carList = document.getElementById("carList");
        const carPicker = document.getElementById("carPickerModal");
        if (!carSelect) return;
        carSelect.innerHTML = '<option value="">Loading...</option>';
        try {
            const response = await fetch("/data/cars.json");
            const data = await response.json();
            carSelect.innerHTML = '<option value="">Select Car</option>';
            data.cars.forEach(car => {
                const option = document.createElement("option");
                option.value = car; option.innerText = car;
                carSelect.appendChild(option);
            });
            if (carList) {
                carList.innerHTML = "";
                data.cars.forEach(car => {
                    const div = document.createElement("div");
                    div.className = "car-item";
                    div.innerText = car;
                    div.onclick = () => {
                        carSelect.value = car;
                        const label = document.getElementById("mobileCarLabel");
                        if (label) label.innerText = car;
                        carPicker.classList.remove("active");
                    };
                    carList.appendChild(div);
                });
            }
            if (mobileTrigger) mobileTrigger.onclick = () => carPicker.classList.add("active");
            if (carPicker) {
                carPicker.addEventListener("click", (e) => {
                    if (e.target === carPicker) carPicker.classList.remove("active");
                });
            }
        } catch (error) {
            carSelect.innerHTML = '<option value="">Failed to load cars</option>';
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.__loginSystem = new LoginSystem();
});
class HeaderScrollHandler {
    constructor() {
        this.header = document.querySelector('header');
        this.mobileWidth = 560;
        this.scrollLimit = 40;
        this.init();
    }
    init() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }
    handleScroll() {
        if (window.innerWidth <= this.mobileWidth) {
            if (window.scrollY > this.scrollLimit) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new HeaderScrollHandler();
});
// ============================================
// MobileMenu — OOP hamburger menu controller
// ============================================
class MobileMenu {
    constructor(hamburgerSelector, overlaySelector, closeSelector, exploreToggleSelector, submenuSelector) {
        this.hamburger = document.getElementById(hamburgerSelector);
        this.overlay = document.getElementById(overlaySelector);
        this.closeBtn = document.getElementById(closeSelector);
        this.exploreToggle = document.querySelector(exploreToggleSelector);
        this.submenu = document.getElementById(submenuSelector);
        this.links = document.querySelectorAll(".mobile-nav-link");
        this.isOpen = false;
        this.init();
    }
    init() {
        this.hamburger.addEventListener("click", () => this.open());
        this.closeBtn.addEventListener("click", () => this.close());
        this.overlay.addEventListener("click", (e) => {
            if (e.target === this.overlay) this.close();
        });
        this.exploreToggle.addEventListener("click", (e) => {
            e.preventDefault();
            this.toggleSubmenu();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isOpen) this.close();
        });
    }
    open() {
        this.isOpen = true;
        this.hamburger.classList.add("open");
        this.overlay.classList.add("open");
        document.body.style.overflow = "hidden";
        this.animateLinks();
    }
    close() {
        this.isOpen = false;
        this.hamburger.classList.remove("open");
        this.overlay.classList.remove("open");
        document.body.style.overflow = "";
        // Reset link animations for next open
        this.links.forEach(link => link.classList.remove("slide-in"));
        if (this.submenu.classList.contains("open")) {
            this.submenu.classList.remove("open");
        }
    }
    animateLinks() {
        this.links.forEach((link, i) => {
            link.classList.remove("slide-in");
            // Force reflow to restart animation
            void link.offsetWidth;
            setTimeout(() => {
                link.style.animationDelay = `${i * 0.08}s`;
                link.classList.add("slide-in");
            }, 10);
        });
    }
    toggleSubmenu() {
        this.submenu.classList.toggle("open");
        // Animate sub-items
        const subLinks = this.submenu.querySelectorAll("a");
        subLinks.forEach((link, i) => {
            link.style.animationDelay = `${i * 0.06}s`;
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new MobileMenu(
        "hamburger",
        "mobileMenuOverlay",
        "mobileMenuClose",
        ".mobile-explore-toggle",
        "mobileSubmenu"
    );
});
// ============================
// class ProfileController {
//     constructor() {
//         this.profileModal = document.getElementById("profileModal");
//         this.closeBtn = document.getElementById("closeProfile");
//         this.profileBtn = document.querySelector(".signin a");
//         this.init();
//     }
//     init() {
//         this.profileBtn.addEventListener("click", () => this.openProfile());
//         this.closeBtn.onclick = () => this.profileModal.style.display = "none";
//     }
//     openProfile() {
//         const user = JSON.parse(localStorage.getItem("user"));
//         document.getElementById("profileName").innerText = user.username;
//         document.getElementById("profileMobile").innerText = user.mobile;
//         this.profileModal.style.display = "flex";
//     }
// }
// document.addEventListener("DOMContentLoaded", () => {
//     new ProfileController();
// });
// ============================
class BookingAPI {
    constructor() {
        this.submitBtn = document.getElementById("submitBooking");
        this.modal = document.getElementById("bookingFormModal");
        this.closeBtn = document.getElementById("closeBookingForm");
        this.init();
    }
    init() {
        this.submitBtn.addEventListener("click", () => this.submit());
        this.closeBtn.onclick = () => this.modal.style.display = "none";
    }
    async submit() {
        const data = {
            name: document.getElementById("bf_name").value,
            mobile: document.getElementById("bf_mobile").value,
            location: document.getElementById("bf_location").value,
            journeyDate: document.getElementById("bf_date").value,
            car: document.getElementById("bf_car").value,
            email: document.getElementById("bf_email").value,
            licenseNumber: document.getElementById("bf_license").value,
            amount: 100000, // you can make dynamic later

            // ✅ ADD THIS LINE
            bookingType: document.getElementById("bf_date").value ? "FUTURE" : "INSTANT"
        };
        try {
            const res = await fetch("http://localhost:8080/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            // Save transaction ID to localStorage so payment page can read it
            localStorage.setItem("transactionId", result.transactionId);
            // Save booking time for edit window tracking
            const times = JSON.parse(localStorage.getItem("bookingTimes") || "{}");
            times[result.transactionId] = new Date().toISOString();
            localStorage.setItem("bookingTimes", JSON.stringify(times));
            toast.success("Booking Confirmed ✅", 5000);
            this.modal.style.display = "none";
        } catch (err) {
            console.error(err);
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new BookingAPI();
});
// ==============================================
