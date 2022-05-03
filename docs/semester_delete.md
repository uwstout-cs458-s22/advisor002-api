# Delete Semester

Returns nothing

- **URL**

  /semesters/:id

- **Method:**

  `DELETE`

- **URL Params**

  _Required:_ User identifier

  `id=[integer]`

  `/semesters/1234`

- **Data Params**

  None

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:** `200`

  **Content:**

  No Content

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

  **_Code:_** `403 FORBIDDEN`

  **_Content:_**

  ```json
  {
    "error": {
      "status": 403,
      "message": "You are not allowed to do this"
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
$.ajax({
  url: '/semesters/1',
  dataType: 'json',
  type: 'DELETE',
  beforeSend: function (xhr) {
    xhr.setRequestHeader('Authorization', 'Bearer t-7614f875-8423-4f20-a674-d7cf3096290e');
  },
  success: function (r) {
    console.log(r);
  },
});
```
