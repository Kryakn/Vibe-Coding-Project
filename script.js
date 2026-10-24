const SUPABASE_URL = "https://zdqiksxcfbmcxohblbdl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UL-ZzDvIelWTimYm-hoJGw_5M8s_d2N";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
// ==================================
// 1. MOBILE NAVIGATION
// ==================================

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
});

// Close the mobile menu after clicking a navigation link.
navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});


// ==================================
// 2. BOOKING DATE VALIDATION
// ==================================

const dateInput = document.querySelector("#bookingDate");

function getLocalDate() {
    const now = new Date();

    const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    );

    return localDate.toISOString().split("T")[0];
}

// Prevent users from selecting a past date.
dateInput.min = getLocalDate();


// ==================================
// 3. DYNAMIC FOOTER YEAR
// ==================================

document.querySelector("#year").textContent =
    new Date().getFullYear();


// ==================================
// 4. GOOGLE SHEETS BOOKING INTEGRATION
// ==================================

// Your deployed Google Apps Script web app URL.
const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyEDOBcc_c6HyV4zx-NKWeuyVoUbxhIQacqxmTadW0fHEEbwUwEPpOriG8VhMu2bqvEaw/exec";

const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");

if (bookingForm) {
  bookingForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(bookingForm);

    const booking = {
      customer_name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      booking_date: formData.get("date"),
      booking_time: formData.get("time"),
      guests: Number(formData.get("guests")),
      special_requests:
        String(formData.get("notes") || "").trim() || null
    };

    if (
      !booking.customer_name ||
      !booking.phone ||
      !booking.booking_date ||
      !booking.booking_time ||
      !Number.isInteger(booking.guests) ||
      booking.guests < 1
    ) {
      formMessage.textContent = "Please complete all required fields.";
      return;
    }

    const submitButton = bookingForm.querySelector(
      'button[type="submit"]'
    );

    if (submitButton) {
      submitButton.disabled = true;
    }

    formMessage.textContent = "Submitting your booking...";

    try {
      const { error } = await supabaseClient
        .from("bookings")
        .insert([booking]);

      if (error) {
        throw error;
      }

      formMessage.textContent =
        "Your table booking has been submitted successfully!";

      bookingForm.reset();

    } catch (error) {
      console.error("Booking submission failed:", error);

      formMessage.textContent =
        "Unable to submit your booking. Please try again.";

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}