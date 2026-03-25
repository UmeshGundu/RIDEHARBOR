class PaymentManager {
    constructor() {
        this.payButton = document.getElementById("payBtn");
        this.carNameElement = document.getElementById("carName");
        this.durationElement = document.getElementById("duration");
        this.bookingData = this.loadBookingData();
        this.displayBookingDetails();
        this.initializeEvents();
    }
    // Load booking data from localStorage
    loadBookingData() {
        const data = localStorage.getItem("bookingData");
        if (data) {
            return JSON.parse(data);
        }
        return null;
    }
    // Show booking details on payment page
    displayBookingDetails() {
        if (!this.bookingData) return;
        this.carNameElement.innerText = "Car : " + this.bookingData.car;
        this.durationElement.innerText = "Duration : " + this.bookingData.duration;
    }
    // Initialize button events
    initializeEvents() {
        this.payButton.addEventListener("click", () => {
            this.processPayment();
        });
    }
    // Call backend API
    async processPayment() {
        if (!this.bookingData) {
            alert("No booking data found.");
            return;
        }
        const paymentData = {
            name: this.bookingData.name,
            email: this.bookingData.email,
            mobile: this.bookingData.mobile,
            car: this.bookingData.car,
            duration: this.bookingData.duration,
            pickupTime: this.bookingData.pickupTime,
            returnTime: this.bookingData.returnTime,
            amount: 500000
        };
        try {
            const response = await fetch("http://localhost:8080/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentData)
            });
            const result = await response.json();
            this.showSuccess(result.transactionId);
        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment failed. Please try again.");
        }
    }
    // Show success message
    showSuccess(transactionId) {
        alert("Payment Successful\nTransaction ID : " + transactionId);
        // clear booking
        localStorage.removeItem("bookingData");
        // redirect to home
        window.location.href = "home.html";
    }
}
// Initialize Payment System
document.addEventListener("DOMContentLoaded", () => {
    new PaymentManager();
});