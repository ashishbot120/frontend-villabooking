# OCEANLUXE VILLAS - Frontend

This is the official frontend for **OCEANLUXE VILLAS**, a modern villa booking platform. It's built with Next.js and TypeScript, offering a fast, responsive, and fully-featured user experience.



## ✨ Key Features

* **User Authentication:** Secure login/signup modal with email/password and Google OAuth.
* **Dynamic Browsing:** Search, filter, and browse villa listings with a clean, dark-mode UI.
* **Property Details:** View detailed villa information, amenities, pricing, and availability.
* **Persistent Cart:** A Redux-powered shopping cart that persists user selections.
* **Secure Checkout:** Integrated with Razorpay for a seamless and secure payment process.
* **User Dashboard:**
    * **My Bookings:** View past and upcoming trips.
    * **My Listings:** A dedicated section for 'host' users to view their listed properties.
* **Role-Based UI:** The interface adapts based on whether the user is a 'user' or a 'host' (e.g., "Become a Host" vs. "Host Dashboard").

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **State Management:** Redux Toolkit
* **Styling:** Tailwind CSS
* **Data Fetching:** Axios
* **Animations:** Framer Motion
* **UI Components:**
    * `lucide-react` (Icons)
    * `react-hot-toast` (Notifications)
    * `date-fns` (Date formatting)

---

## 🚀 Getting Started

### 1. Prerequisites

* Node.js (v18 or later)
* `npm` or `yarn`
* A running instance of the [backend API](https://github.com/your-username/backend_villabooking)

### 2. Installation

1.  Clone the repository:
    ```sh
    git clone [https://github.com/your-username/client-villabooking.git](https://github.com/your-username/client-villabooking.git)
    cd client-villabooking
    ```

2.  Install dependencies:
    ```sh
    npm install
    # or
    yarn install
    ```

### 3. Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables:

```env
# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

# Razorpay Key ID (for payment modal)
NEXT_PUBLIC_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID

# The URL of your backend API
NEXT_PUBLIC_API_URL=http://localhost:5000