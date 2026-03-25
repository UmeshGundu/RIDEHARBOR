// Transp on scroll — mobile only
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
// Create object (this activates the functionality)
new HeaderScrollHandler();
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
// bwm mobile scroll glass effect
class CardScrollAnimator {
    constructor(selector, mobileWidth = 560, threshold = 0.25) {
        this.cards = document.querySelectorAll(selector);
        this.mobileWidth = mobileWidth;
        this.threshold = threshold;
        this.observer = null;
        this.init();
    }
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            if (window.innerWidth <= this.mobileWidth) {
                this.createObserver();
                this.observeCards();
            }
        });
    }
    createObserver() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersect(entries),
            { threshold: this.threshold }
        );
    }
    handleIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }
    observeCards() {
        this.cards.forEach(card => this.observer.observe(card));
    }
}
// Activate
new CardScrollAnimator(".model-card");
// =============================================
// BmwBooking
// =============================================
class BmwBooking {
    constructor() {
        this.signinDiv = document.querySelector(".signin");
        this.loggedIn = !!localStorage.getItem("user");
        this.selectedCar = "";
        this.loginModal = document.getElementById("loginModal");
        this.bookingModal = document.getElementById("bookingFormModal");
        this.closeLoginBtn = document.getElementById("closeLogin");
        this.closeBookingBtn = document.getElementById("closeBookingForm");
        this.sendOtpBtn = document.getElementById("sendOtpBtn");
        this.verifyOtpBtn = document.getElementById("verifyOtpBtn");
        this.otpSection = document.getElementById("otpSection");
        this.submitBtn = document.getElementById("submitBooking");
        this.signinLink = document.querySelector(".signin a");
        this.init();
    }
    init() {
        if (this.loggedIn && this.signinLink) {
            this.signinLink.innerText = "Profile";
        }
        if (this.loggedIn && this.signinDiv) {
            this.signinDiv.classList.add("logged-in");
        }
        // Desktop signin/profile click
        if (this.signinLink) {
            this.signinLink.addEventListener("click", (e) => {
                e.preventDefault();
                if (!this.loggedIn) {
                    this.loginModal.style.display = "flex";
                } else {
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (!user) return;
                    document.getElementById("profileName").innerText = user.username;
                    document.getElementById("profileMobile").innerText = user.mobile;
                    document.getElementById("profileModal").style.display = "flex";
                }
            });
        }
        // Mobile icon click
        if (this.signinDiv) {
            this.signinDiv.addEventListener("click", (e) => {
                if (e.target === this.signinLink) return;
                if (!this.loggedIn) {
                    this.loginModal.style.display = "flex";
                } else {
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (!user) return;
                    document.getElementById("profileName").innerText = user.username;
                    document.getElementById("profileMobile").innerText = user.mobile;
                    document.getElementById("profileModal").style.display = "flex";
                }
            });
        }
        // Rent buttons
        document.querySelectorAll(".model-card button").forEach(btn => {
            btn.addEventListener("click", () => {
                const card = btn.closest(".model-card");
                this.selectedCar = card.querySelector("h3").innerText.trim();
                this.handleRentClick();
            });
        });
        // Close buttons
        if (this.closeLoginBtn) this.closeLoginBtn.onclick = () => this.loginModal.style.display = "none";
        if (this.closeBookingBtn) this.closeBookingBtn.onclick = () => this.bookingModal.style.display = "none";
        const closeProfile = document.getElementById("closeProfile");
        if (closeProfile) closeProfile.onclick = () => document.getElementById("profileModal").style.display = "none";
        // Backdrop click
        [this.loginModal, this.bookingModal].forEach(modal => {
            if (modal) modal.addEventListener("click", (e) => {
                if (e.target === modal) modal.style.display = "none";
            });
        });
        if (this.sendOtpBtn) this.sendOtpBtn.onclick = () => this.sendOtp();
        if (this.verifyOtpBtn) this.verifyOtpBtn.onclick = () => this.verifyOtp();
        if (this.submitBtn) this.submitBtn.onclick = () => this.submitBooking();
    }
    handleRentClick() {
        if (!this.loggedIn) {
            this.loginModal.style.display = "flex";
        } else {
            this.openBookingModal();
        }
    }
    openBookingModal() {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            document.getElementById("bf_name").value = user.username || "";
            document.getElementById("bf_mobile").value = user.mobile || "";
        }
        document.getElementById("bf_car").value = this.selectedCar;
        document.getElementById("bf_location").value = "";
        document.getElementById("bf_date").value = "";
        document.getElementById("bf_email").value = "";
        document.getElementById("bf_license").value = "";
        document.getElementById("bf_duration").value = "";
        document.getElementById("bf_pickupTime").value = "";
        this.bookingModal.style.display = "flex";
    }
    async sendOtp() {
        const username = document.getElementById("usernameInput").value.trim();
        const mobile = document.getElementById("mobileInput").value.trim();
        if (!username || !mobile) { alert("Enter username and mobile number"); return; }
        try {
            const res = await fetch("http://localhost:8080/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, mobileNumber: mobile })
            });
            await res.json();
            this.otpSection.style.display = "block";
            alert("OTP Sent");
        } catch (err) { console.error(err); alert("Failed to send OTP"); }
    }
    async verifyOtp() {
        const username = document.getElementById("usernameInput").value.trim();
        const mobile = document.getElementById("mobileInput").value.trim();
        const otp = document.getElementById("otpInput").value.trim();
        try {
            const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, mobileNumber: mobile, otp })
            });
            const data = await res.json();
            if (data.status === "success") {
                this.loggedIn = true;
                localStorage.setItem("user", JSON.stringify({ username, mobile }));
                this.loginModal.style.display = "none";
                if (this.signinLink) this.signinLink.innerText = "Profile";
                if (this.signinDiv) this.signinDiv.classList.add("logged-in");
                alert("Login Successful");
                this.openBookingModal();
            } else {
                alert("Invalid OTP");
            }
        } catch (err) { console.error(err); alert("OTP verification failed"); }
    }
    calculateReturnTime(pickupTime, duration) {
        if (!pickupTime || !duration) return "";
        const hours = parseInt(duration);
        if (isNaN(hours)) return "";
        const [h, m] = pickupTime.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m, 0);
        date.setHours(date.getHours() + hours);
        return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    async submitBooking() {
        const name = document.getElementById("bf_name").value.trim();
        const mobile = document.getElementById("bf_mobile").value.trim();
        const location = document.getElementById("bf_location").value.trim();
        const journeyDate = document.getElementById("bf_date").value;
        const car = document.getElementById("bf_car").value.trim();
        const email = document.getElementById("bf_email").value.trim();
        const licenseNumber = document.getElementById("bf_license").value.trim();
        const duration = document.getElementById("bf_duration").value;
        const pickupTime = document.getElementById("bf_pickupTime").value;
        if (!name || !mobile || !location || !journeyDate || !car || !email || !licenseNumber || !duration || !pickupTime) {
            alert("Please fill all fields");
            return;
        }
        const payload = {
            name, mobile, location, journeyDate, car, email,
            licenseNumber, duration, pickupTime,
            returnTime: this.calculateReturnTime(pickupTime, duration),
            amount: 50000
        };
        try {
            const res = await fetch("http://localhost:8080/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            alert("Booking Confirmed ✅\nTransaction ID: " + result.transactionId);
            this.bookingModal.style.display = "none";
        } catch (err) { console.error(err); alert("Booking failed. Please try again."); }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new BmwBooking();
});
