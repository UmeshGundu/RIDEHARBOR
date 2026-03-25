// Transparent → black header on scroll — mobile only
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