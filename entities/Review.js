{
  "name": "Review",
  "type": "object",
  "properties": {
    "album_id": {
      "type": "string",
      "description": "Reference to the album being reviewed"
    },
    "rating": {
      "type": "number",
      "description": "Rating from 0 to 100"
    },
    "title": {
      "type": "string",
      "description": "Review headline"
    },
    "content": {
      "type": "string",
      "description": "Full review text"
    },
    "reviewer_name": {
      "type": "string",
      "description": "Display name of reviewer"
    },
    "is_critic": {
      "type": "boolean",
      "description": "Whether this is from a verified critic",
      "default": false
    },
    "helpful_count": {
      "type": "number",
      "description": "Number of helpful votes",
      "default": 0
    }
  },
  "required": [
    "album_id",
    "rating",
    "content"
  ],
  "rls": {
    "create": {
      "created_by": "{{user.email}}"
    },
    "read": {},
    "update": {
      "$or": [
        {
          "created_by": "{{user.email}}"
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
          "created_by": "{{user.email}}"
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