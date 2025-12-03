# Firebase Setup Guide

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and follow the wizard
3. Enable Authentication (Email/Password provider)
4. Create Firestore Database

## 2. Configure Firebase Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ratings/{contentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /userRatings/{userId}/ratings/{contentId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                             (resource.data.userId == request.auth.uid || 
                              request.auth.token.admin == true);
    }
  }
}
