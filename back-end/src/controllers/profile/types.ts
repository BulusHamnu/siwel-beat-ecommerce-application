interface notification {
  emailNotification: {
    commentAndLikes: boolean;
  };
}
export interface updates {
  username?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  bio?: string;
  profilePic?: string;
  email?: string;
  notification?: notification;
}

export interface updates2Type extends updates {
  "notification.emailNotification.commentAndLIkes": any;
}
