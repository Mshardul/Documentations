window.addEventListener('DOMContentLoaded', function() {
  var script  = document.createElement('script');
  script.src  = "../shared/highlight/highlight.min.js";
  script.type = 'text/javascript';
  script.defer = true;
  document.getElementsByTagName('head').item(0).appendChild(script);
});
  
window.addEventListener('load', function() {
  hljs.highlightAll();

  /* create Table of content */
  const topicDivs = document.getElementsByClassName('topic');
  let tocElement = '<ul>';
  const noOfTopicDivs = topicDivs.length;
  for (let i = 0; i < noOfTopicDivs; i++) {
    const topicDiv = topicDivs[i]
    const topicId = topicDiv.id;
    const headingDiv = topicDivs[i].getElementsByClassName('topic-heading')[0];
    const heading = headingDiv.getElementsByTagName('h2')[0];
    const headingTitle = heading.innerHTML;

    /* table of content */
    tocElement += `<li><a href='#${topicId}'>${headingTitle}</a></li>`;
    
    /* adding span */
    heading.innerHTML += '<span class="icon">&#9757;</span>';
    const iconSpan = headingDiv.getElementsByTagName('span')[0];
    const bodyDiv = topicDivs[i].getElementsByClassName('topic-body')[0];

    /* showing/hiding body div on clicking title */
    heading.addEventListener('click', function(event) {
      if(bodyDiv.style.display == "none") {
        bodyDiv.style.display = "block";
        iconSpan.innerHTML = "&#9757;";
      } else {
        bodyDiv.style.display = "none";
        iconSpan.innerHTML = "&#9759;";
      }
    })
    

  }
  tocElement += '</ul>';
  document.getElementById('menu-content').innerHTML = tocElement;
  /* */
});