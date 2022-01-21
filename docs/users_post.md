# Create User

Create a new User. Note users created by this API are created with a `user` role and initially disabled.

- **URL**

  /users/

- **Method:**

  `POST`

- **URL Params**

  None

- **Data Params**

  _Required_: UserId and Email

  ```json
  {
    "email": "joe25@example.com",
    "userId": "user-test-f8b0f866-35de-4ba4-9a15-925775baebe"
  }
  ```

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:** `201`

  Or `200` if an user with matching `userId` already exists

  **Content:**

  ```json
  {
    "id": 1234,
    "email": "joe25@example.com",
    "enable": true,
    "role": "user",
    "userId": "user-test-f8b0f866-35de-4ba4-9a15-925775baebe"
  }
  ```

- **Error Response:**

  **Code:** `400 BAD REQUEST`

  If either parameter `email` or `userId` is not provided in Data parameters.

  **Content:**

  ```json
  {
    "error": {
      "status": 400,
      "message": "Required Parameters Missing"
    }
  }
  ```

  **Code:** `500 INTERNAL ERROR`

  **Content:**

  ```json
  {
    "error": {
      "status": 500,
      "message": "Internal Server Error"
    }
  }
  ```

## Sample Call:

```javascript
try {
  fetch('/users', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({ userId: data.eventData.userId, email: data.eventData.email }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
} catch (e) {
  console.log(e);
}
```
