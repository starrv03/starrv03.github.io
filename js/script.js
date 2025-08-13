function init(){

    const BASE_URL=`./json/data.json`;
    const STORAGE_KEY="grade-management-system";
    let gradeSystemData={};

    document.getElementById("addNewRecordForm").addEventListener("submit",addNewRecord);

    async function getData(){
        if(!window.localStorage.getItem(STORAGE_KEY)){
            const resp=await fetch(`${BASE_URL}`);
            gradeSystemData=await resp.json();
            saveData();
        }
        else{
            gradeSystemData=JSON.parse(window.localStorage.getItem(STORAGE_KEY));
        }
        renderContent();
    }


    function renderContent(){
        const mainHeading=document.getElementById("title");
        mainHeading.textContent=gradeSystemData.projectName;
        const records=gradeSystemData.records;
        records.forEach(record => displayRecord(record));
    }

    function saveData(){
       window.localStorage.setItem(STORAGE_KEY, JSON.stringify(gradeSystemData,null,2));
    }


    function displayRecord(record){
        const section=document.getElementsByTagName("main")[0].firstElementChild;
        const div=document.createElement("div");
        div.classList.add("col");
        const article=document.createElement("article");
        article.id=`article-${record.id}`;
        const button=document.createElement("button");
        button.textContent="x";
        button.classList.add("delete");
        button.addEventListener("click",deleteRecord);
        article.append(button);
        const name=document.createElement("p");
        name.textContent=record.name;
        name.classList.add("name");
        article.append(name);
        const attendance=document.createElement("p");
        attendance.textContent=`Attendance: ${record.attendance}%`;
        article.append(attendance);
        const more=document.createElement("p");
        more.classList.add("more-info");
        more.textContent="more info";
        more.addEventListener("click",toggleMoreInfo);
        article.append(more);
        const gradesDiv=document.createElement("div");
        gradesDiv.classList.add("grades-div");
        const gradeHeading=document.createElement("p");
        gradeHeading.classList.add("grades-heading");
        gradeHeading.textContent="Grades";
        gradesDiv.append(gradeHeading);
        const ul=document.createElement("ul");
        record.grades.forEach(grade=>{
            const li=document.createElement("li");
            li.textContent=`${grade}%`;
            ul.append(li);
        });
        gradesDiv.append(ul);
        const form=document.createElement("form");
        form.id="add-new-grade-form";
        form.addEventListener("submit",updateGrades);
        let newGradeDiv=document.createElement("div");
        const label=document.createElement("label");
        label.setAttribute("for","new-grade");
        label.textContent="Update Grades";
        newGradeDiv.append(label);
        const input=document.createElement("input");
        input.type="text";
        input.id="new-grade";
        input.name="new-grade";
        input.pattern="^\\d+(,{1}\\d+)*";
        input.title="grades must be comma seperated numbers";
        input.required=true;
        newGradeDiv.append(input);
        form.append(newGradeDiv);
        newGradeDiv=document.createElement("div");
        const submit=document.createElement("input");
        submit.type="submit";
        submit.id="submit-new-grade";
        submit.name="submit-new-grade";
        submit.value="update grades";
        newGradeDiv.append(submit);
        form.append(newGradeDiv);
        gradesDiv.append(form);
        article.append(gradesDiv);
        article.append(gradesDiv);
        div.append(article);
        section.getElementsByClassName("row")[0].append(div);
    }

    function toggleMoreInfo(e){
        const target=e.target;
        const parent=target.parentElement;
        const gradesDiv=parent.getElementsByClassName("grades-div")[0];
        const display=window.getComputedStyle(gradesDiv).getPropertyValue("display");
        if(display==="none"){
            const moreInfo=parent.getElementsByClassName("more-info")[0];
            moreInfo.textContent="hide info";
            gradesDiv.style.display="block";
        }
        else{
            const moreInfo=parent.getElementsByClassName("more-info")[0];
            moreInfo.textContent="more info";
            gradesDiv.style.display="none";
        }
    }

     async function addNewRecord(e){
        e.preventDefault();
        const form=e.target;
        const grades=form.grades.value;
        const regex=/^\d+(,{1}\d+)*/;
        const match=regex.test(grades);
        if(!match) {
            alert("Grade must be comma seperated integers");
            return;
        }
        let gradesList=form.grades.value.split(",");
        gradesList=gradesList.map(grade=>parseFloat(grade));
        const record={name:form.name.value, course:form.course.value, grades:gradesList, attendance:parseFloat(form.attendance.value), status:form.status.value};
        record.id=gradeSystemData.metadata.totalRecords+1;
        // TODO: Validate the record
        // TODO: Update metadata
        const result=validateRecord(record);
        // TODO: Add to projectData.records
        if(result.status){
            gradeSystemData.records.push(record);
            gradeSystemData.metadata.totalRecords++;
            gradeSystemData.metadata.lastUpdated;
            saveData();
            displayRecord(record);
        }
        else{
            alert(result.msg);
        }
    }

    async function deleteRecord(e){
        const parent=e.target.parentElement;
        const id=parent.id.split("-")[1];
        let records=gradeSystemData.records.filter(record=>record.id===parseInt(id));
        if(records.length<=0){
            alert("record does not exist");
        }
        const record=records[0];
        const idx=gradeSystemData.records.indexOf(record);
        console.log("record found ",record,"at index ",idx);
        const deleted=gradeSystemData.records.splice(idx,1);
        console.log("records deleted: ",deleted);
        gradeSystemData.metadata.totalRecords--;
        saveData();
        parent.remove();
    }

    async function updateGrades(e){
        e.preventDefault();
        let grades=e.target["new-grade"].value.split(",");
        grades=grades.map(grade=>parseFloat(grade));
        const updates={grades};
        console.log(updates);
        const parent=e.target.parentElement.parentElement;
        const id=parent.id.split("-")[1];
        if(typeof updates!=="object"){
             alert("updates must be an object");
             return;
        }
        let record=gradeSystemData.records.filter(record=>record.id===parseInt(id));
        if(record.length<=0){
            alert("record does not exist");
            return;
        }
        record=record[0];
        //validate record
        const result=validateRecord(updates);
        // TODO: Update metadata
        if(result.status){
            // TODO: Apply updates
            for(const key in updates){
                record[key]=updates[key];
            }
            gradeSystemData.metadata.lastUpdated;
            saveData();
            const gradesList=parent.getElementsByTagName('ul')[0];
            while(gradesList.firstChild){
                gradesList.firstChild.remove();
            }
            record.grades.forEach(grade=>{
                const li=document.createElement("li");
                li.textContent=`${grade}%`;
                gradesList.append(li);
            });
            return;
        }
        alert(result.msg);
    }

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
                    if(!status) return {status,msg:status? "" : `${key} must be a number`};
                }
                else if(key==="name"){
                    status=typeof record[key]==="string" && isValidName(record[key]);
                    if(!status) return {status,msg:status? "" : `${key} must be a string and have at least 3 letters`};
                }
                else if(key==="course"){
                    status=typeof record[key]==="string" && isValidCourse(record[key]);
                    if(!status) return {status,msg:status? "" : `${key} must be a string and have at least 3 letters`};
                }      
                else if(key==="grades"){
                    status=Array.isArray(record[key]) && isNumberArr(record[key]) && isInRangeArr(record[key],0,100);
                    if(!status) return {status,msg:status? "" : `${key} must be a list of number grades in the range 0 to 100 inclusive`};
                }   
                else if(key==="attendance"){
                    status=typeof record[key]==="number" && isInRange(record[key],0,100);
                    if(!status) return {status,msg:status? "" : `${key} must be a number in the range 0 to 100 inclusive`};
                }  
                else{
                    status=typeof record[key]==="string" && (record[key]==="active" || record[key]==="inactive");
                    if(!status) return {status,msg:status? "" : `${key} must be a string and have a value of active or inactive`};
                }           
            }
        }
        return {status:true,msg:""};
    }


    getData(); 
}

init();


