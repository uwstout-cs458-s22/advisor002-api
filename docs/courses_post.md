# Create Course

Create a new Course. If no additional information about the course is provided (semester, category, etc.) it will be null when returned

- **URL**

  /courses/

- **Method:**

  `POST`

- **URL Params**

  None

- **Data Params**

  _Required_: Section, name, and credits

  _Optional:_ type, year

  ```json
  {
    "section": 101,
    "name": "Computer Science I",
    "credits": 3,
    "type": "spring",
    "year": 2022
  }
  ```

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:** `201`

  **Content:**

  ```json
  {
    "id": 1234,
    "name": "Computer Science I",
    "credits": 3,
    "type": "spring",
    "year": 2022
  }
  ```

- **Error Response:**

  **Code:** `400 BAD REQUEST`

  If the parameters `name`, `credits`, or `section` are not provided in Data parameters.

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
  fetch('/courses', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({ name: name, credits: credits, section: section }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
} catch (e) {
  console.log(e);
}
```
