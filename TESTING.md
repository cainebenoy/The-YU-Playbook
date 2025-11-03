
# YU Playbook - Comprehensive Testing Guide

This guide provides a step-by-step process to test the full functionality of the YU Playbook application. Follow these instructions carefully to ensure every feature works as expected.

## 1. Prerequisites

### a. Run the Application
Make sure the development server is running.
```bash
npm run dev
```
The app will be available at `http://localhost:9002`.

### b. Create Test Users
You will need to test the application from three different perspectives. Use the **Sign Up** page to create three separate accounts:
-   **Admin User:** `admin@test.com`
-   **Coach User:** `coach@test.com`
-   **Player User:** `player@test.com`

### c. Set User Roles in Firebase
The application assigns a default role of `player` on sign-up. You must manually update the roles for the admin and coach users directly in your Firebase Firestore database.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.
2.  Navigate to **Firestore Database**.
3.  In the `users` collection, find the documents for `admin@test.com` and `coach@test.com`.
4.  Edit the `role` field for each user:
    -   For `admin@test.com`, set the `role` field to `admin`.
    -   For `coach@test.com`, set the `role` field to `coach`.

---

## 2. Admin Role Testing

**Log in as `admin@test.com`**. You should see "Admin" specific menu items in your user profile dropdown in the header.

### a. Create a Tournament
1.  Navigate to the **Admin Dashboard** (or click "Create Tournament" from the user dropdown).
2.  Click the **Create Tournament** button.
3.  Fill in the form with a name (e.g., "Summer Showdown"), location, and dates.
4.  Click **Create Tournament**.
5.  **Verification:** You should see a success notification, and the new tournament should appear on the Admin Dashboard and the public `/tournaments` page.

### b. Create a Match
1.  From the Admin Dashboard, click the **Matches** button on the tournament card you just created.
2.  Select the tournament from the dropdown.
3.  **Note:** You can't create a match yet because no teams are registered. We will come back to this after the Coach has registered teams.

### c. Live Scoring
1.  Navigate to the **Scoring** page (from the Admin Dashboard or user dropdown).
2.  **Note:** You will not see any matches here until they are created. We will return to this step later.

---

## 3. Coach Role Testing

**Log out from the admin account and log in as `coach@test.com`**.

### a. Create a Team
1.  Navigate to the **My Teams** page from the header link.
2.  Go to the **Register Team** tab.
3.  Enter a team name (e.g., "The Void Strikers") and click **Create Team**.
4.  **Verification:** The new team should appear under the "My Teams" tab.

### b. Manage the Roster
1.  On your newly created team card, click **Manage Roster**.
2.  In the dialog, add a fictional player (e.g., Name: "Test Player", Number: "99").
3.  Click the **Add Player** button.
4.  Change the role of the new player from "Player" to "Captain" using the dropdown.
5.  **Verification:** The player should appear in the roster list. Their role should update, and a success notification should appear.

### c. Register Team for Tournament
1.  Navigate to the public `/tournaments` page.
2.  Find the "Summer Showdown" tournament created by the admin.
3.  Click the **Register Team** button.
4.  In the dialog, select "The Void Strikers" from the dropdown and click **Confirm Registration**.
5.  **Verification:** A success notification should appear. The tournament card should now show "1 teams registered".

### d. Create Announcements & Events
1.  Go back to the **My Teams** page.
2.  On the team card, click **Announcements**. Write a message (e.g., "Practice at 6 PM sharp!") and click **Send Message**.
3.  Click **Schedule Event**. Fill out the form to create a "Practice" event for tomorrow.
4.  **Verification:** Visit the public team page (by clicking **View Public Page**). The announcement should be visible. Navigate to the `/schedule` page; the event you created should be listed.

---

## 4. Player Role Testing

**Log out from the coach account and log in as `player@test.com`**.

### a. Set a Personal Goal
1.  Navigate to your **Profile** page.
2.  On the "My Goals" tab, enter a new goal (e.g., "Score 5 points in the tournament").
3.  Click **Add**.
4.  **Verification:** The goal should appear in the list. You should be able to check it as "Completed" and delete it.

### b. Discover & Join a Team
1.  Create another team as the coach (e.g., "The Black Holes").
2.  As the player, navigate to the **Discover Teams** page.
3.  Find "The Black Holes" and click **Request to Join**.
4.  **Verification:** The button should change to "Request Pending".

### c. Verify Coach Can Approve Request
1.  Log back in as `coach@test.com`.
2.  Go to **My Teams** and click **Manage Requests** on "The Black Holes" card.
3.  You should see the request from `player@test.com`. Click **Approve**.
4.  **Verification:** Log back in as `player@test.com`. Go to the **Discover Teams** page. The button for "The Black Holes" should now say "Joined".

---

## 5. Completing the Loop (Admin, Coach, Player)

### a. Create a Match (Admin)
1.  **Log in as `admin@test.com`**.
2.  Go to the **Matches** page.
3.  Select the "Summer Showdown" tournament.
4.  You should now see "The Void Strikers" and "The Black Holes" in the team dropdowns.
5.  Create a match between them and set a start time.
6.  **Verification:** A success notification should appear. The match should be visible on the `/live-scores` page.

### b. Score the Match (Admin)
1.  Go to the **Scoring** page.
2.  Find the match you created. Update the scores for Team A and Team B and set the status to "In Progress". Click **Update Match**.
3.  Set the scores again (e.g., 15 to 12) and set the status to **Final**. Click **Update Match**.
4.  **Verification:** Notifications should confirm the updates. A final notification should state that standings are being updated.

### c. Verify Final Results (All Roles)
1.  **As Admin:** The match should now disappear from the Scoring Admin page (since it's final).
2.  **As Anyone:** Go to the `/tournaments` page. The "Summer Showdown" standings should now be updated with one win for the winning team and one loss for the losing team.
3.  **As Player (`player@test.com`):** Go to your **Profile** page and view the "Tournament History" tab. The result of the match should be recorded there.
4.  **As Coach (`coach@test.com`):** Go to the **Coaching** page. Click "View / Add Logs" for the player who was on the winning/losing team. Add a coaching log note.
5.  **As Player (`player@test.com`):** Go to your **Profile** page and view the "Coaching Logs" tab. The new log from the coach should be visible.

---

This completes the end-to-end test of all major features. If all these steps work as described, the application is in a very solid state.
