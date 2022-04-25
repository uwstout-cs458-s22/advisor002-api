# Edit attributes for a course, category, or semester

Used to edit the attributes of a preexisting course, category, or semester, very similar format for each.

- **URL**

  /courses/#
  /categories/#
  /semesters/#

  ID = #

- **Method:**

  `PUT`

- **URL Params**

  ID number of the 'object' being edited

  EX: You want to edit semester with ID 1
  http://localhost:3000/semesters/1

- **Data Params**

      At least one parameter of the list is required in order to successfully send the request.

      Courses:

  ```json
  {
    "name": "TestClass222",
    "section": 22,
    "credits": 2,
    "prefix": "TC",
    "type": "spring",
    "year": 2022
  }
  ```

      Categories:

  ```json
  {
    "name": "TestCategory",
    "prefix": "TC"
  }
  ```

      Semesters:

  ```json
  {
    "year": 200,
    "type": "fall"
  }
  ```

- **Auth required** : YES, Bearer token in Authorization header. Must be Director or Admin

## Response

- **Success Response:**

  **Code:** `200`

  Success

  **Content:**

  ```json
  {
    "id": 1234,
    "name": "TestClass222",
    "section": 22,
    "credits": 2,
    "prefix": "TC",
    "type": "spring",
    "year": 2022
  }
  ```

- **Possible Error Responses:**

  **Code:** `400`

  If no attributes are given

  **Code:** `403`

  User does not have permission

  **Code:** `404`

  'Object' is not found with given ID

  **Code:** `500`

  Other database/code errors

  **Content:**

  ```json
  {
    "error": {
      "status": ###,
      "message": "***"
    }
  }
  ```
