{
  "name": "Follow",
  "type": "object",
  "properties": {
    "follower_email": {
      "type": "string",
      "description": "Email of the user who is following"
    },
    "following_email": {
      "type": "string",
      "description": "Email of the critic/user being followed"
    },
    "following_name": {
      "type": "string",
      "description": "Display name of the person being followed"
    }
  },
  "required": [
    "follower_email",
    "following_email"
  ],
  "rls": {
    "create": {
      "data.follower_email": "{{user.email}}",
      "created_by": "{{user.email}}",
      "data.following_email": {
        "$ne": "{{user.email}}"
      }
    },
    "read": {
      "$or": [
        {
          "data.follower_email": "{{user.email}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "update": {
      "$or": [
        {
          "data.follower_email": "{{user.email}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "delete": {
      "$or": [
        {
          "data.follower_email": "{{user.email}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    }
  }
}