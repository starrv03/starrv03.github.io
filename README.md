# Grade Tracker System

## Project Information
- **Student Name**: Valencia Starr
- **Project Theme**: Grade Tracker System
- **Date**: August 15, 2025

## Project Description
This is a grade tracker system where you could keep track of student grades

## Data Structure

Example:
```javascript
gradeSystemData={
        projectName: "Student Grade Tracker",
        records: [],
        metadata: {
            totalRecords: 0,
            lastUpdated: new Date().toISOString()
        }
    };
```

## Core Functions
List and briefly describe each function in your project:

1. `addRecord(record)`: adds a new record
2. `removeRecord(id)`: removes a record
3. `updateRecord(id,update)`: updates a record
4. `searchRecord(id)`: searches a record by id
5. `validateRecord(record)`: validates a record before creating or updating
6. `getData()` : fetches data from json file
7. `saveData()` : saves data to local storage
8. `getRecords()` : gets all records
9. `searchRecord(id)` : search records by id
10. `getMetadata()` : gets metadata
11. `getProjectName()` : gets project name

## How to Use
Provide step-by-step instructions on how to use your application:

1. Go to home page
2. View student records
3. Use form to add new student record
4. Use form for each student record to update grades


## Special Features
This is just a starter app for demonstration purposes.  A newer and improved app will come later.