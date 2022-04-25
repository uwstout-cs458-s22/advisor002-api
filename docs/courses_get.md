# Show Course

Returns json data about a single course.

- **URL**

  /courses/:id

- **Method:**

  `GET`

- **URL Params**

  _Required:_ User identifier

  `id=[integer]`

  `/courses/1234`

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
    "section": 101,
    "name": "Computer Science I"
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
  url: '/courses/1',
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

# Show a Course List

Returns a json array about all courses.

- **URL**

  /courses/

- **Method:**

  `GET`

- **URL Params**

  _Optional:_ Limit the user records returned

  `limit=[integer]`

  `/courses?limit=50`

  _Optional:_ Offset the first record locator

  `offset=[integer]`

  `/courses?offset=12`

  _Optional:_ Category Id

  `categoryid=[integer]`

  `/courses?categoryid=1`

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
      "section": 101,
      "name": "Computer Science I"
    },
    {
      "id": 4321,
      "section": 102,
      "name": "Computer Science II"
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
  url: '/courses/',
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
