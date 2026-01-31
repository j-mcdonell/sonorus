{
  "name": "Album",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Album title"
    },
    "artist": {
      "type": "string",
      "description": "Artist or band name"
    },
    "cover_url": {
      "type": "string",
      "description": "URL to album cover art"
    },
    "release_year": {
      "type": "number",
      "description": "Year of release"
    },
    "genre": {
      "type": "string",
      "enum": [
        "Rock",
        "Pop",
        "Hip-Hop",
        "R&B",
        "Electronic",
        "Jazz",
        "Classical",
        "Country",
        "Metal",
        "Indie",
        "Alternative",
        "Folk",
        "Soul",
        "Punk",
        "Blues",
        "Reggae",
        "Latin",
        "World",
        "Other"
      ],
      "description": "Primary genre"
    },
    "tracklist": {
      "type": "array",
      "description": "List of track names",
      "items": {
        "type": "string"
      }
    },
    "description": {
      "type": "string",
      "description": "Album description or notes"
    },
    "spotify_url": {
      "type": "string",
      "description": "Link to Spotify (optional)"
    }
  },
  "required": [
    "title",
    "artist"
  ],
  "rls": {
    "create": {
      "user_condition": {
        "role": {
          "$in": [
            "user",
            "admin"
          ]
        }
      }
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