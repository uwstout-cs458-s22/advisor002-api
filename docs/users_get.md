# Show User

Returns json data about a single user.

- **URL**

  /users/:id

- **Method:**

  `GET`

- **URL Params**

  _Required:_ User identifier

  `id=[integer]`

  `/users/1234`

  OR

  `id=[text]`

  `/users/user-test-f8b0f866-35de-4ba4-9a15-925775baebe`

- **Data Params**

  None

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:** `200`

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

  **Code:** `404 NOT FOUND`

  **Content:**

  ```json
  {
    "error": {
      "status": 404,
      "message": "Not Found"
    }
  }
  ```

  OR

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
$.ajax({
  url: '/users/1',
  dataType: 'json',
  type: 'GET',
  beforeSend: function (xhr) {
    xhr.setRequestHeader('Authorization', 'Bearer t-7614f875-8423-4f20-a674-d7cf3096290e');
  },
  success: function (r) {
    console.log(r);
  },
});
```

# Show a User List

Returns a json array about all users.

- **URL**

  /users/

- **Method:**

  `GET`

- **URL Params**

  _Optional:_ Limit the user records returned

  `limit=[integer]`

  `/users?limit=50`

  _Optional:_ Offset the first record locator

  `offset=[integer]`

  `/users?offset=12`

- **Data Params**

  None

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:** `200`

  **Content:**

  ```json
  [
    {
      "id": 1234,
      "email": "joe25@example.com",
      "enable": true,
      "role": "user",
      "userId": "user-test-f8b0f866-35de-4ba4-9a15-925775baebe"
    },
    {
      "id": 4567,
      "email": "barb26@example.com",
      "enable": true,
      "role": "admin",
      "userId": "user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c"
    }
  ]
  ```

  OR

  **Content:** `[]`

- **Error Response:**

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
$.ajax({
  url: '/users/',
  dataType: 'json',
  type: 'GET',
  beforeSend: function (xhr) {
    xhr.setRequestHeader('Authorization', 'Bearer t-7614f875-8423-4f20-a674-d7cf3096290e');
  },
  success: function (r) {
    console.log(r);
  },
});
```
