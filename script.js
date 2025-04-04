
//toggle sidebar
var sidebarOpen = false;
var sidebar = document.getElementById("sidebar");  

function openSidebar(){
    if(!sidebarOpen){
        sidebar.add("sidebar-responsive");
        sidebarOpen = true;
    }
}

function closeSidebar(){
    if(sidebarOpen){
        sidebar.remove("sidebar-responsive");
        sidebarOpen = false;
    }
}

// Đọc dữ liệu từ project_heart_disease.csv
d3.csv("../data/project_heart_disease.csv").then(function(data) {
    data.forEach(d => {
        d.Age = +d.Age;  // Chuyển đổi từ string sang number
        d["Blood Pressure"] = +d["Blood Pressure"];  // Chuyển đổi từ string sang number
        d["Cholesterol Level"] = +d["Cholesterol Level"];  
        d.BMI = parseFloat(d.BMI);  // Chuyển thành số thực
    });
    console.log(data[0]);
}).catch(function(error) {
    console.error("Lỗi khi đọc file CSV:", error);
});


