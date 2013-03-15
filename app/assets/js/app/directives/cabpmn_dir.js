'use strict'

angular.module('camundaorg.directives')

.directive('bpmnRender', function() {
  require({
        baseUrl: "./",
        packages: [
             { name: "dojo", location: "assets/js/lib/dojo/dojo"},
             { name: "dojox", location: "assets/js/lib/dojo/dojox"},
             { name: "bpmn", location: "assets/js/app/bpmn"}]
  });
  return {
    link: function(scope, element, attrs) {
      var bpmnResource = attrs.bpmnRender;

      require(["bpmn/Bpmn"], function(Bpmn) {
            new Bpmn().renderUrl("assets/bpmn/" + bpmnResource + ".bpmn", {
                diagramElement : element[0].id,
                overlayHtml : '<div style="position: relative; top:100%"></div>',
                width : $(element).width(),
                height : $(element).height()
            }).then(function (bpmn){
                scope.bpmn = bpmn;
                //bpmn.zoom(0.8);
                //bpmn.annotate("reviewInvoice", '<span class="bluebox"  style="position: relative; top:100%">New Text</span>', ["highlight"]);
            });
        });
    }
  }
})
.directive('bpmnSrc', function() {
  return {
    link: function(scope, element, attrs) {

    	var bpmnResource = attrs.bpmnSrc;
		
		bpmn(bpmnResource, element);
		//$('body').scrollspy('refresh');
    }
  }
})
.directive('bpmnRun', function() {
  return {
    scope: true,
    transclude: true, 
    template: '<div><div ng-transclude></div><button class="btn btn-primary" ng-click="startProcess()"><i class="icon-play"></i> Play</button></div>',
    link: function(scope, element, attrs) {

      var bpmnResource = attrs.bpmnSrc;

      $.get("../app/assets/bpmn/" + bpmnResource + ".bpmn", function(data){
        
        scope.processDefinition = CAM.transform(data)[0];

        if(!scope.startProcess) {
          scope.startProcess = function() {
             var execution = new CAM.ActivityExecution(scope.processDefinition);
             execution.variables["paperId"] = element.attr("id");
              execution.start();
          }
        }

    });
  }
}
})
.directive('bpmnReferenceList', function() {
  return {
    link: function(scope, element, attrs) {
    
    
    


    }
  }
})
.directive('bpmnTutorial', function($location) {
  return {
    link: function(scope, element, attrs) {
		
		$('.tutPop', element).popover({
			"trigger": "hover",
			"placement": "bottom"
		});

    // update active entry in Breadcrumb

    var link = '#' + $location.path();

    // Remove any active entry marker from list
    $('.bpmnSymbolLink').parent().removeClass("active");

    if (link == '#/design/reference') {
      $('#breadcrumbOverview').text('Symbol Reference');
      $('#breadcrumbOverview').addClass('active');
      $('#breadcrumbSymbol').text('');
    } else {

      $('#breadcrumbOverview').removeClass('active');
      $('#breadcrumbOverview').html('<a href="design-reference.html#/design/reference">Symbol Reference</a> <span class="divider">/</span>');
      // Highlight active entry in list
      $('a[href="' + link + '"]').parent().addClass("active");
      // update Breadcrumb active entry
      $('#breadcrumbSymbol').text($('a[href="' + link + '"]').text());

    }



    }
  }
})
.directive('caAffix', function() {
  return {
    link: function(scope, element, attrs) {
		
		$(element).affix({"offset":250});
		//$('body').scrollspy({"target":"#navSide"});
    }
  }
})
.directive('bpmnSymbol', function() {
  return {
    link: function(scope, element, attrs) {
		var bpmnSymbol = attrs.bpmnSymbol;
		var bpmnSymbolName = attrs.bpmnSymbolName;
		drawBpmnSymbol (bpmnSymbol, bpmnSymbolName, element);
    }
  }
})
.directive('imgThumb', function() {
  return {
    link: function(scope, element, attrs) {
      //alert (attrs.imgSrc);
      
      $(element).append('<a href="#myModal_' + attrs.id +'" data-toggle="modal"><img src="' + attrs.imgSrc +'"/></a><div class="center"><p style="padding-top:5px; font-size:90%"><i class="icon-zoom-in"></i> click to enlarge</p></div>');
      $(element).append('<div id="myModal_' + attrs.id +'" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
  + '<div class="modal-body">'
    + '<img src="' + attrs.imgSrc +'"/>'
    + '</div>'
    + '<div class="modal-footer">'
    + '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'
    + '</div>'
    + '</div>');
    }
  }
})
.directive('camundaEvents', function() {
  return {
    link: function(scope, element, attrs) {

      $.getJSON('http://www.camunda.org/php/meeting.php', function(data) {
          
          $.each( data.events, function( key, value ) {

            var myDateString = value.meeting.date;

            var myRow = "<td>" + myDateString + "</td><td><img src='assets/img/app/community/meetings/" + value.meeting.country + ".png' > " + value.meeting.country + "</td><td>" + value.meeting.city + "</td><td>" + value.meeting.subject + "</td><td>" + value.meeting.attendees + " attendees</td><td>" + parseInt(value.meeting.seats - value.meeting.attendees)  + " seats left</td>";
            var selectDate = '<td><a style="color:black;" href="community-meetings-single.html?id=' + value.meeting.id +'" role="button" class="btn">Register</a></td>';
         
            myRow = "<tr>" + selectDate + myRow + "</td></tr>";
            element.append(myRow);

            
          });

      });
    }
  }
})
.directive('camundaEventsHome', function() {
  return {
    link: function(scope, element, attrs) {

      $.getJSON('http://www.camunda.org/php/meeting.php', function(data) {

          $.each( data.events, function( key, value ) {

            var myDateString = value.meeting.date.substring(0,6);
            var myRow = myDateString + " | " + value.meeting.city + " | <a style='color:lightblue;' href='community-meetings-single.html?id=" + value.meeting.id + "'>" + value.meeting.subject + "</a><br/>";
            element.append(myRow);
            
          });

      });
    }
  }
})
.directive('meeting', function() {
    function updateAttendees  (meetingId) {
       $.getJSON('http://www.camunda.org/php/meeting.php?id=' + meetingId, function(data) {
          $.each( data.events, function( key, value ) {
            var freeSeats = parseInt(value.meeting.seats - value.meeting.attendees);
            if (freeSeats < 1) {
              $('.mSeats').text ('Sorry, there are no seats left :-(');
              $('#mSubmit').attr('disabled', 'true');
            } else {
              $('.mSeats').text('Currently we have ' + value.meeting.attendees + ' attendees. There are still ' + parseInt(value.meeting.seats - value.meeting.attendees) + ' seats left!');
            }

          });
        });
    }
  return {
    link: function(scope, element, attrs) {

      // Helper for getting Get param
      var HTTP_GET_VARS=new Array();
      var strGET=document.location.search.substr(1,document.location.search.length);
      if(strGET!='')
          {
          var gArr=strGET.split('&');
          for(var i=0;i<gArr.length;++i)
              {
              var v='';var vArr=gArr[i].split('=');
              if(vArr.length>1){v=vArr[1];}
              HTTP_GET_VARS[unescape(vArr[0])]=unescape(v);
              }
          }
        var meetingId = HTTP_GET_VARS["id"];


        $.getJSON('http://www.camunda.org/php/meeting.php?id=' + meetingId, function(data) {
        
          $.each( data.events, function( key, value ) {
          
          $('.mCountry').append(value.meeting.country);
          $('.mCity').text(value.meeting.city);
          $('.mDate').text(value.meeting.date);
          $('.mSubject').append(value.meeting.subject);
          $('.mText').append(value.meeting.text);
          $('.mPlace').append(value.meeting.place + ' (<a target="_blank" href="https://maps.google.de/maps?q=' + value.meeting.place + '">Google Maps</a>)');

            if (parseInt(value.meeting.seats - value.meeting.attendees) < 1) {
              $('.mSeats').text ('Sorry, there are no seats left :-(');
              $('#mSubmit').attr('disabled', 'true');
            } else {
              $('.mSeats').text('Currently we have ' + value.meeting.attendees + ' attendees. There are still ' + parseInt(value.meeting.seats - value.meeting.attendees) + ' seats left!');
            }

            jQuery.validator.setDefaults({
              debug: false,
              onsubmit: true,
              success: "valid"
            });;
             
                $("#registerForm_1").validate({
              rules: {
                mName: "required",
                mEmail: "required email"
              }
            });


            $('#mSubmit').on('click', function(meeting) {
              if ($("#registerForm_1").valid()) {
                var myName =  $('#mName').val();
                var myEmail = $('#mEmail').val();

                $('#formContainer').append('<p id="status">Processing...</p>');
                // alert (myName + myEmail);
               // HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", "*");
                 $.ajax({
                 // pfad zur PHP Datei (ab HTML Datei)
                      url: "http://www.camunda.org/php/register.php",
                 // Daten, die an Server gesendet werden soll in JSON Notation
                      data: {id: value.meeting.id, name: myName, email: myEmail},
                      datatype: "jsonp",
                 // Methode POST oder GET
                 type: "POST",
                 // Callback-Funktion, die nach der Antwort des Servers ausgefuehrt wird
                      success: function(data) { 
                        $('#status').text(data);
                        $('#mName').val("");
                        $('#mEmail').val("");
                        updateAttendees  (meetingId);
                      }
                 });
              }             
            });   

          });

      });

     
  }
}
})
.directive('meetingsSubscribe', function() {
  return {
    link: function(scope, element, attrs) {
  
            jQuery.validator.setDefaults({
              debug: false,
              onsubmit: true,
              success: "valid"
            });;
             
                $("#subscribeForm").validate({
              rules: {
                email: "required email"
              }
            });

            $('#submit').on('click', function(event) {
              if ($("#subscribeForm").valid()) {
                
                var myEmail = $('#email').val();
                 $.ajax({
                 // pfad zur PHP Datei (ab HTML Datei)
                      url: "http://www.camunda.org/php/subscribeMeetings.php",
                 // Daten, die an Server gesendet werden soll in JSON Notation
                      data: {email: myEmail},
                      datatype: "jsonp",
                 // Methode POST oder GET
                 type: "POST",
                 // Callback-Funktion, die nach der Antwort des Servers ausgefuehrt wird
                      success: function(data) { 
                        $('#status').text(data);
                        $('#email').val('');                        
                      }
                 });
              }             
            });   

     
    }
  }
})
.directive('camTweets', function() {
  return {
    link: function(scope, element, attrs) {
      //alert (attrs.imgSrc);

    $(element).tweet({
          join_text: "auto",
          query: "#camunda",
          avatar_size: 30,
          count: 3,
          loading_text: "loading tweets..."
        });      
     
    }
  }
})
.directive('camBlogs', function() {
  return {
    link: function(scope, element, attrs) {
      //alert (attrs.imgSrc);

     $.getFeed({
        url: 'http://www.bpm-guide.de/feed/?lang_view=en',
        success: function(feed) {
        
            $(element).append('<h2>'
            + '<a href="'
            + feed.link
            + '">'
            + feed.title
            + '</a>'
            + '</h2>');
            
            var html = '';
            
            for(var i = 0; i < feed.items.length && i < 5; i++) {
            
                var item = feed.items[i];
                
                html += '<h3>'
                + '<a href="'
                + item.link
                + '">'
                + item.title
                + '</a>'
                + '</h3>';
                
                html += '<div class="updated">'
                + item.updated
                + '</div>';
                
                html += '<div>'
                + item.description
                + '</div>';
            }
            
            $(element).append(html);
        }    
    });     
     
    }
  }
})
.directive('vision', function() {
  return {
    link: function(scope, element, attrs) {
/*
    $('a').fadeIn('slow', function() {
        alert ("hi");
      });

    var controller = $.superscrollorama();
    controller.addTween('a', 
      TweenMax.from($('a'), .5, {css:{opacity:0}}));     
    
    controller.addTween('#fade2', 
      TweenMax.from($('#fade2'), .5, {css:{opacity:0}}));

    controller.addTween('#fade5', 
      TweenMax.from($('#fade5'), .5, {css:{opacity:0}}));    
  */

  
  $('#explainScalable').popover({
    "title":"Scalable Business Model",
    "trigger": "hover",
    "content": "<div class='explain' ><p>BPM cannot help you inventing a great product or persuading your customers to buy it.</p><p>But if you do have the right product and a market to conquer, BPM can provide you with the infrastructure you need to turn a corner shop into a big yet profitable business.</p><p>Why BPM? To scale up your business model!</p></div>",
    "html": true
  });
    }
  }
})

