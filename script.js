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