Built by Team Builders&Breakers @ Tech4Social Good Hackathon!
# YU Playbook

YU Playbook is a comprehensive, full-stack web application designed for managing sports leagues, teams, and player development. Built with a modern tech stack, it provides a seamless, real-time experience for administrators, coaches, and players.

The platform offers a complete suite of tools, from user registration with role-based access control to live tournament scoring and dynamic player history tracking.

![YU Playbook Screenshot](https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxzcG9ydHMlMjBzdGFkaXVtfGVufDB8fHx8MTc2MjE0MjQ2M3ww&ixlib=rb-4.1.0&q=80&w=1080)

## Key Features

- **Role-Based User System:** Secure authentication with distinct roles for **Admins**, **Coaches**, and **Players**.
- **Admin Dashboard:** A centralized hub for admins to manage tournaments, create matches, and oversee the platform.
- **Tournament Management:** Admins can create and manage full tournament events.
- **Live Scoring:** A real-time scoring page for admins to update ongoing match scores and statuses.
- **Team Management:** Coaches can create teams, manage their rosters, and review requests from players wanting to join.
- **Player Profiles:** Dynamic user profiles that display personal information, coaching logs, and a complete tournament history.
- **Dynamic Coaching Logs:** Coaches can write and save development logs for their players, which are visible on both coach and player dashboards.
- **Automated Tournament History:** Player profiles are automatically updated with their match results and scores after a match is finalized.
- **Real-Time Database:** Built on Firestore for a snappy, real-time user experience across the application.
- **Modern UI/UX:** A polished, responsive, and consistent dark-themed interface built with ShadCN UI and Tailwind CSS.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- Node.js (v18 or later)
- `npm` or `yarn`

### Firebase Setup

This project requires a Firebase project to run.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In your new project, go to **Project settings** (the gear icon) > **General**.
3.  Under "Your apps", click the web icon (`</>`) to create a new web app.
4.  Give the app a nickname and click "Register app".
5.  You will be shown a `firebaseConfig` object. You will need these values for your environment variables.

### Installation & Running the App

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/yu-playbook.git
    cd yu-playbook
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a file named `.env.local` in the root of the project and add your Firebase configuration keys:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
