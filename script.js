/* 
    #Available formats:
        ##ISO FORMAT:
            * YYYY-MM-DD
            * DD-MM-YYYY
        ##SHORT FORMAT:
            * MM/DD/YYYY
            * YYYY/MM/DD
        ##LONG FORMAT:
            * Mount DD YYYY
            * Mou DD YYYY
            * Mount YYYY DD
            * Mou YYYY DD
            * YYYY Mount DD
            * DD Mount YYYY
            * YYYY Mou DD
            * DD Mou YYYY
*/


let form = document.getElementById("employees-form");
let dataContainer = document.getElementById("myData");
let data;
form.addEventListener('submit', e => {
    e.preventDefault();
    
    //1.Get CSV file and create file reader instance
    const input = dataCSV.files[0]
    const reader = new FileReader();
    reader.onload = e => {
        const text = e.target.result
        //2.Read CSV file and store data in array
        data = csvToArray(text)
        //3.Initialize state values
        let counter = 0
        let togetherArr = []
        //4.Loop through data rows 
        data.forEach(data1 => {
            //5.For every row of data, loop through the others to find particular pair, but after every loop update counter to avoid duplicates 
            counter++
            for(let i = counter ; i < data.length ; i++){
                //6.Check if current pair have worked on the same project
                if(data1.projectId == data[i].projectId){
                    //7.Check if they have worked in the same timestamp and store them in array
                    if(daysTogether = subtractDates(data1.startDate, data1.endDate, data[i].startDate, data[i].endDate)){
                        togetherArr.push({
                            employeeId1: data1.employeeId,
                            employeeId2: data[i].employeeId,
                            projectId: data1.projectId,
                            daysWorked: Math.ceil(daysTogether)
                        })
                    }
                }
            }
        });
        //8.Finally display fetched data on UI
        togetherArr.forEach(row => {
            dataContainer.innerHTML += `<tr>
                <td>#${row.employeeId1}</td>
                <td>#${row.employeeId2}</td>
                <td>#${row.projectId}</td>
                <td style="text-align: right">${row.daysWorked}</td>
            </tr>`
        })
    }
    reader.readAsText(input)  
})

function csvToArray(str){
    let rows = str.split("\n");
    let dataCSVArr = rows.map(row => {
        let columns = row.split(",")
        
        return {
            employeeId: columns[0]?.replaceAll(" ", ""),
            projectId: columns[1]?.replaceAll(" ", ""),
            startDate: columns[2]?.trim(),
            endDate: columns[3]?.replace("\r", "").trimStart()
        }
       
        
    })
    return dataCSVArr
}

function subtractDates(startDate1, endDate1, startDate2, endDate2){
    startDate1 = new Date(startDate1).getTime()
    startDate2 = new Date(startDate2).getTime()
    endDate1 = endDate1 != "NULL" ? new Date(endDate1).getTime() : new Date().getTime()
    endDate2 = endDate2 != "NULL" ? new Date(endDate2).getTime() : new Date().getTime()

    if(endDate1 < startDate2 || endDate2 < startDate1) return false;
    //Scenario 1: Second employee already in project, first start 
    if(startDate2 <= startDate1 && startDate1 >= startDate2){ 
        //Scenario 1.1: First employee finish first
        if(endDate1 <= endDate2) return (endDate1 - startDate1) / (1000 * 60 * 60 * 24) + 1; 
        //Scenario 1.2: Second employee finish first
        if(endDate2 <= endDate1) return (endDate2 - startDate1) / (1000 * 60 * 60 * 24) + 1;
    //Scenario 2: First employee already in project, second start     
    }else if(startDate1 <= startDate2 && startDate2 >= startDate1){ 
        //Scenario 2.1: First employee finish first
        if(endDate2 <= endDate1) return (endDate2 - startDate2) / (1000 * 60 * 60 * 24) + 1;
        //Scenario 2.2: Second employee finish first
        if(endDate1 <= endDate2) return (endDate1 - startDate2) / (1000 * 60 * 60 * 24) + 1;
    }
    return false;
}

