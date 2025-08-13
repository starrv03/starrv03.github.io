import fs from 'node:fs';

const JSON_URL="../../json/data.json";

let gradeSystemData={
    projectName: "Student Grade Tracker",
    records: [],
    metadata: {
        totalRecords: 0,
        get lastUpdated(){
            return new Date().toISOString();
        }
    }
};

// Add a new record
export function addRecord(record) {
    if(!typeof record==="object") return {status:false, msg: "record must be an object"};
    if(!(record.name && record.course && record.grades && record.attendance && record.status)) return {status:false, msg: "record must have name, course, grades, attendance, and status"};
    fetchData();
    record.id=gradeSystemData.metadata.totalRecords+1;
    const result=validateRecord(record);
     if(result.status){
        gradeSystemData.records.push(record);
        gradeSystemData.metadata.totalRecords++;
        gradeSystemData.metadata.lastUpdated;
        saveData();
        return record;
     } 
     return result;
}

// Remove a record by ID
export function removeRecord(id) {
    fetchData();
    let record=gradeSystemData.records.filter(record=>record.id===id);
    if(record.length<=0){
        return {status:false,msg: "record does not exist"};
    }
    record=record[0];
    const idx=gradeSystemData.records.indexOf(record);
    gradeSystemData.records.splice(idx,1);
    gradeSystemData.metadata.totalRecords--;
    gradeSystemData.metadata.lastUpdated;
    saveData();
    return {status:true,msg:""};
}

// Update an existing record
export function updateRecord(id, updates) {
    if(typeof updates!=="object"){
        return {status:false,msg: "updates must be an object"};
    }
    fetchData();
    let record=gradeSystemData.records.filter(record=>record.id===id);
    if(record.length<=0){
        return {status:false,msg: "record does not exist"};
    }
    record=record[0];
    const result=validateRecord(updates);
    if(result.status){
        for(const key in updates){
            record[key]=updates[key];
        }
        gradeSystemData.metadata.lastUpdated;
        saveData();
    }
    return result;
}

// Search records based on criteria
export function searchRecords(id) {
    fetchData();
    const filteredRecords=gradeSystemData.records.filter(record=>record.id===id);
    if(filteredRecords.length<0){
        return {status:false,msg: "record does not exist"}
    };
    return filteredRecords[0];
}

//get records
export function getRecords(){
    fetchData();
    return gradeSystemData.records;
}

export function getData(){
    fetchData();
    return gradeSystemData;
}

function fetchData(){
    const data=JSON.parse(fs.readFileSync(JSON_URL,'utf-8')); 
    gradeSystemData=data;
}

// Calculate statistics or summary
function generateSummary() {
    fetchData();
    const summary=[];
    gradeSystemData.records.forEach(record=>{
        const studentSummary={};
        studentSummary.studentId=record.id;
        studentSummary.studentName=record.name;
        studentSummary.gpa=record.grades.reduce((total,value)=>total+=value,0)/record.grades.length;
        summary.push(studentSummary);
    });
    return summary;
}

// 3. Data Processing Functions

// Parse JSON string to object
function loadData(jsonString) {
     let data;
     try{
        data=JSON.parse(jsonString);
     }catch(e){
        console.log(e.message);
     }
   const result=validateRecord(data);
   if(!result.status){
        console.log(result.msg);
        return result.status;
   }
   return data;
}

// Convert object to JSON string
function saveData() {
    console.log("saving data....");
    const json=JSON.stringify(gradeSystemData,null,2);
    try{
        fs.writeFileSync(JSON_URL, json);
        console.log("data saved!!");
    }
    catch(error){
        console.log(error.message);
    }

}

// Validate a record before adding/updating
function validateRecord(record) {

    function isInRange(value,min,max){
        if(typeof value!=="number" || typeof min!=="number" || typeof max!=="number") return false;
        return value>=min && value<=max;
    }

    function isInRangeArr(arr,min,max){
        if(!Array.isArray(arr) || typeof min!=="number" || typeof max!=="number") return false;
        for(let i=0; i<arr.length; i++){
            if(!isInRange(arr[i],min,max)) return false;
        };
        return true;
    }

     function isNumberArr(arr){
        arr.forEach(value=>{
            if(!typeof value==="number") return false;
        });
        return true;
    }

    function isValidName(name){
        const regex=/^[A-Za-z]{3,}(\s[A-Za-z]{1,})*$/;
        return regex.test(name);
    }

    function isValidCourse(name){
        const regex=/^[A-Za-z]{3,}(\s[A-Za-z]{1,})*$/;
        return regex.test(name);
    }

    if(typeof record!="object") return {status:false, msg: "Record must be an object"};
    const validKeys=new Set(["id","name","course","grades","attendance","status"]);
    let status=false;
    for(const key in record){
        if(!validKeys.has(key)){
            return {status:false,msg:`${key} is an invalid key`};
        }
        else{
            if(key==="id"){
                status=typeof record[key]==="number";
                if(!status) return {status,msg: `${key} must be a number`};
            }
            else if(key==="name"){
                status=typeof record[key]==="string" && isValidName(record[key]);
                if(!status) return {status,msg:`${key} must be a string with letters and spaces and have at least 3 letters`};
            }
            else if(key==="course"){
                status=typeof record[key]==="string" && isValidCourse(record[key]);
                if(!status) return {status,msg: `${key} must be a string with letters and spaces and have at least 3 letters`};
            }      
            else if(key==="grades"){
                status=Array.isArray(record[key]) && isNumberArr(record[key]) && isInRangeArr(record[key],0,100);
                if(!status) return {status,msg:`${key} must be a list of number grades in the range 0 to 100 inclusive`};
            }   
            else if(key==="attendance"){
                status=typeof record[key]==="number" && isInRange(record[key],0,100);
                if(!status) return {status,msg:status? "" : `${key} must be a number in the range 0 to 100 inclusive`};
            }  
            else{
                status=typeof record[key]==="string" && (record[key]==="active" || record[key]==="inactive");
                if(!status) return {status,msg:`${key} must be a string and have a value of active or inactive`};
            }           
        }
    }
    return {status:true,msg:""};
}

// Display all records
function displayRecords() {
    const json=JSON.stringify(gradeSystemData,null,2);
    console.log("records: ",json);
}

// Display search results
function displaySearchResults(results) {
    console.log("search results: ",results);
}

// Display summary statistics
function displaySummary(summary) {
    console.log("summary",summary);

}


function seed(){
    gradeSystemData = {
        projectName: "Student Grade Tracker",
        records: [],
        metadata: {
            totalRecords: 0,
            get lastUpdated(){
                return new Date().toISOString();
            }
        }
    };
    saveData();
    // Add records
    console.log("Adding records:");
    let newRecord={
        // Create a sample record based on your theme
            name: "Alice Johnson",
            course: "Mathematics",
            grades: [85, 92, 78, 90],
            attendance: 95,
            status: "active"
        };
    addRecord(newRecord);   
    newRecord = {
        // Create a sample record based on your theme
        name: "Samantha Simons",
        course: "Chemistry",
        grades: [75, 92, 96, 99],
        attendance: 100,
        status: "active"
    };
    addRecord(newRecord);
    newRecord = {
        // Create a sample record based on your theme
        name: "Charles Smith",
        course: "Chemistry",
        grades: [95, 92, 96, 99],
        attendance: 100,
        status: "active"
    };
    addRecord(newRecord);
    newRecord={name:"Sam Price",course:"math",grades:[99,100],attendance:100,status:"active"};
    addRecord(newRecord);
}



// 6. Test Cases
// TODO: Create at least 5 test cases demonstrating your functions work correctly
function runTests() {
    console.log("\n=== Running Tests ===");

    // Test 1: Add record
    // Test 2: Remove record
    // Test 3: Update record
    // Test 4: Search records
    // Test 5: Generate summary

    console.log("=== Tests Complete ===\n");
}

function initialTest(){
     console.log("=== Student Grade Management System ===\n");

    // Initialize with sample data
    console.log("Loading initial data...");

    // Test all functionality
    console.log("\nTesting core functions...\n");

    // Test 1: Display all records
    console.log("1. Displaying all records:");
    displayRecords();
    
    // Test 2: Add a new record
    console.log("\n2. Adding a new record:");
    let newRecord = {
        // Create a sample record based on your theme
        id: 1,
        name: "Samantha Simons",
        course: "Chemistry",
        grades: [75, 92, 96, 99],
        attendance: 100,
        status: "active"
    };
    addRecord(newRecord);
    displayRecords();

    // Test 3: Search for records
    const searchId=2;
    console.log("\n3. Searching for records with id ",searchId);
    let searchResults = searchRecords(searchId);
    displaySearchResults(searchResults);

    // Test 4: Update a record
    const updateId=2;
    console.log("\n4. Updating a record with id ",updateId);
    updateRecord(updateId, { status: "inactive" });
    displayRecords();

    // Test 5: Remove a record
    const removeId=1;
    console.log("\n5. Removing a record with id ",removeId);
    removeRecord(removeId);
    displayRecords();

    // Test 6: Generate summary
    console.log("\n6. Generating summary:");
    let summary = generateSummary();
    displaySummary(summary);

    //Save data
    console.log("Saving data!!");
    saveData();
}

// Uncomment to run tests
// runTests();


//Main Program

function main() {
   seed();
}

// Start the program
//main();