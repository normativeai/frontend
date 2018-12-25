var hlin = function() {
  var elem = $(this);
  var factClasses = elem.attr("class").split(" ").filter(id => id.startsWith("hl-fact-"));
  if (!!factClasses && factClasses.length == 1) {
    var f = "."+factClasses[0];
    $(f).each(function() {
      $(this).addClass("hl-form-active");
    });
    return;
  }
  var vocClasses = elem.attr("class").split(" ").filter(id => id.startsWith("hl-voc-"));
  if (!!vocClasses && vocClasses.length == 1) {
    var f = "."+vocClasses[0];
    $(f).each(function() {
      $(this).addClass("hl-vocabulary-active");
    });
    return;
  }
}
var hlout = function() {
  var elem = $(this);
  var factClasses = elem.attr("class").split(" ").filter(id => id.startsWith("hl-fact-"));
  if (!!factClasses && factClasses.length == 1) {
    var f = "."+factClasses[0];
    $(f).each(function() {
      $(this).removeClass("hl-form-active");
    });
    return;
  }
  var vocClasses = elem.attr("class").split(" ").filter(id => id.startsWith("hl-voc-"));
  if (!!vocClasses && vocClasses.length == 1) {
    var f = "."+vocClasses[0];
    $(f).each(function() {
      $(this).removeClass("hl-vocabulary-active");
    });
    return;
  }
}

$(function(){
  var elems = $('.hl').hover(hlin, hlout);
})



/*
const regex = /Id\(Ob\((.+)\)\)/gm;
          var asd = "it must be the case that";
          var asso = new Map([['D','the seller delivers the goods, hands over the documents and transfers the property according to the procedure described in the contract'],['D0.1','the contract requires the seller to take care of the carriage of goods']])
const str = `Id(Ob(D))`;
let m;

while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }
    
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match}`);
    });
}
*/
