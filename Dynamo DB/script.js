window.onload = function(e){ 
}

/* sidebar functions */
function toggle_sidebar_topics() {
  const sidebar_topics = document.getElementById("sidebar_topics");
  if (sidebar_topics.style.display === 'none') {
    document.getElementById("sidebar_topics_icon").innerHTML = "&times;";
    sidebar_topics.style.display = "block";
  } else {
    document.getElementById("sidebar_topics_icon").innerHTML = "&#9776;";
    document.getElementById("sidebar_topics").style.display = "none";
  } 
}