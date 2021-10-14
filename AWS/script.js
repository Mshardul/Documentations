window.addEventListener('DOMContentLoaded', function() {
  var script  = document.createElement('script');
  script.src  = "../shared/highlight/highlight.min.js";
  script.type = 'text/javascript';
  script.defer = true;
  document.getElementsByTagName('head').item(0).appendChild(script);
});
  
window.addEventListener('load', function() {
  hljs.highlightAll();
});

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