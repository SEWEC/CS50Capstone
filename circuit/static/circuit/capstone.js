var lastSide = "";

updateList = [];

phaseTwo = [];

deletedList = [];

currentKey = 0;

notDict = {};

var snapShot = [];

var reSnapShot = [];

var copyList = [];

var del = false;

var page = 0;

class not{
    constructor(id) {
        this.before = true;
        this.after = true;
        this.lineTo = []
        this.lineFrom = []
        this.notUpdated = true;
        this.id = id;
      }
}

document.addEventListener("DOMContentLoaded", function(){
    if(window.location.pathname.length > 1){
        let parentSvg = document.getElementById("parentSvg");
        console.log(window.location.pathname);
        fetch("/project" + window.location.pathname)
        .then(response => response.json())
        .then(jsonData => {
            let titleData = JSON.parse(jsonData.project)
            parentSvg.innerHTML = titleData.innerHTML;
            notDict = titleData.notDict;
            updateList = titleData.updateList;
            currentKey = titleData.currentKey;
            document.getElementsByTagName("title").innerHTML = window.location.pathname;
            return titleData;
        })
        .then( titleData => {
            main();
        });
    } else{
        main();
    }
});

function main(){
    let svg = document.getElementById("svg");
    svg.addEventListener('mousedown', (event) => {
        svgClick(event);
    });
    window.setInterval(() =>{
        itterate();
    }, 150);
}

function svgClick(event){
    createSnapShot();
    lastSide = "";
    window.addEventListener('mouseup', upHandle);
    let cx = event.clientX;
    let cy = event.clientY;
    let x = cx - 60 - parentSvg.getBoundingClientRect().x;
    let y = cy - 48 - parentSvg.getBoundingClientRect().y;
    parentSvg = document.getElementById("parentSvg");
    parentSvg.innerHTML += getNotHtml(x,y);
    document.getElementById("svg").addEventListener("mousedown",event => svgClick(event));
    window.addEventListener('mousemove', rotateHandle)
    notDict[currentKey] = new not(currentKey);
    currentKey++;
    function rotateHandle(event){
        let rotate = Math.atan2(cy-event.clientY,cx-event.clientX)*180/Math.PI + 180;
        parentSvg.lastChild.setAttribute('transform', "rotate("+ rotate +" "+ (x+67) +" "+ (y+48) +")");
    }

    function upHandle(){
        window.removeEventListener('mousemove',rotateHandle);
        window.removeEventListener('mouseup',upHandle);
    }
}

function getNotHtml(x, y, rotation){
    let rot = "";
    if(rotation != undefined){
        rot = 'transform="'+ rotation +'"';
    }
    return '<g data-notkey="'+ currentKey +'" '+ rot +'><polygon id="'+ currentKey +'" onclick="notClick(this)" points="' + (x+19)+','+(y+0) + " " + (x+19)+','+(y+96) + " " + (x+115)+','+(y+48) +'" style="fill:deepskyblue;stroke:black;stroke-width:1" />'
    + '<circle onclick="' + "nodeClick(this,'front')" + '" cx="' + (x+115) + '" cy="' + (y+48) + '" r="18" stroke="black" stroke-width="1" fill="slategray" />'
    + '<circle onclick="' + "nodeClick(this,'back')" + '" cx="' + (x+19) + '" cy="' + (y+48) + '" r="18" stroke="black" stroke-width="1" fill="slategray" /></g>';
}

function wireClick(element, ifSnapShot){
    if(ifSnapShot == undefined){
        createSnapShot();
    }
    lastSide = "";
    let to = Number(element.parentElement.dataset.to);
    let from = Number(element.parentElement.dataset.from);
    updateList.push(to);
    notDict[to].lineFrom.splice(notDict[to].lineFrom.indexOf(from), 1);
    notDict[from].lineTo.splice(notDict[from].lineTo.indexOf(to), 1);
    element.parentElement.remove();
}

function notClick(element){
    createSnapShot();
    lastSide = "";
    let notKey = Number(element.parentElement.dataset.notkey);
    console.log("notkey", notKey);
    let toList = notDict[notKey].lineTo.slice();
    let fromList = notDict[notKey].lineFrom.slice();
    function remWire(call){
        for(let i = 0; i < toList.length; i++){
            wireClick(document.getElementById(String(notKey + " " + toList[i])).firstChild, false);
        }
        for(let i =0; i< fromList.length; i++){
            wireClick(document.getElementById(String(fromList[i] + " " + notKey)).firstChild, false);
        }
        call()
    }
    function remNot(){
        deletedList.push(notKey);
        delete notDict[notKey];
        element.parentElement.remove();
    }
    remWire(remNot);
}

function drawLine(start, end){
    createSnapShot();
    parentSvg = document.getElementById("parentSvg");
    let p = parentSvg.createSVGPoint();
    p.x = start.cx.baseVal.value;
    p.y = start.cy.baseVal.value;
    let s = p.matrixTransform(start.getCTM());
    p.x = end.cx.baseVal.value;
    p.y = end.cy.baseVal.value;
    let e = p.matrixTransform(end.getCTM());
    let endKey = Number(end.parentElement.dataset.notkey);
    let startKey = Number(start.parentElement.dataset.notkey);
    if(document.getElementById(String(startKey + " " + endKey)) == null){
        updateList.push(endKey);
        notDict[endKey].lineFrom.push(startKey);
        notDict[startKey].lineTo.push(endKey);
        parentSvg.innerHTML += '<g id="'+ startKey +" "+ endKey +'" data-to="'+ endKey +'" data-from="'+ startKey +'"><line onclick="wireClick(this)" x1="'+ s.x +'" y1="'+ s.y +'" x2="'+ e.x +'" y2="'+ e.y +'" style="stroke:black;stroke-width:5" />' +
        '<line onclick="wireClick(this)" x1="'+ s.x +'" y1="'+ s.y +'" x2="'+ e.x +'" y2="'+ e.y +'" style="stroke:slategray;stroke-width:3" /></g>';
        document.getElementById("svg").addEventListener("mousedown",event => svgClick(event));
    }
}

function nodeClick(node, side){
    if(lastSide == ""){
        lastNode = node;
        lastSide = side;
    } else if(lastSide == "front" && side == "back"){
        drawLine(lastNode, node);
        lastSide = "";
    } else if(lastSide == "back" && side == "front"){
        drawLine(node, lastNode)
        lastSide = "";
    } else{
        lastSide = "";
    }
}

function areaSelect(){
    parentSvg = document.getElementById("parentSvg");
    if(parentSvg.lastChild.id != "shield"){
        parentSvg.innerHTML += '<rect id="shield" width="10000" height="10000" style="fill: transparent;"></rect>';
        document.getElementById("shield").addEventListener('mousedown', (event) => clickSelect(event, parentSvg));
    }
}

function clickSelect(event, parentSvg){
    let x = event.clientX - parentSvg.getBoundingClientRect().x;
    let y = event.clientY - parentSvg.getBoundingClientRect().y;
    parentSvg.lastChild.remove();
    parentSvg.innerHTML += '<rect id="selection" x="'+ (event.clientX - parentSvg.getBoundingClientRect().x) +'" y="'+ (event.clientY - parentSvg.getBoundingClientRect().y) +'" width="1" height="1" style="fill: darkslategray; opacity: .5;"></rect>' + '<rect id="shield" width="10000" height="10000" style="fill: transparent;"></rect>';
    let len = parentSvg.children.length;
    let shield = document.getElementById("shield");
    shield.addEventListener('mousemove', moveHandle);
    shield.addEventListener('mousedown', downHandle);
    
    function downHandle() {
        shield.removeEventListener('mousemove', moveHandle);
        shield.removeEventListener('mousedown',downHandle);
        shield.addEventListener('mousedown', reset);
    }

    function reset(){
        parentSvg.lastChild.remove();
        parentSvg.lastChild.remove();
        document.getElementById("svg").addEventListener('mousedown', (event) => svgClick(event));
    }

    function moveHandle(event){
        parentSvg.children[len-2].setAttribute('width', event.clientX - parentSvg.getBoundingClientRect().x - x);
        parentSvg.children[len-2].setAttribute('height', event.clientY - parentSvg.getBoundingClientRect().y - y);
    }
}

function cut(){
    let parentSvg = document.getElementById('parentSvg');
    let len = parentSvg.children.length;
    if (len > 2 && parentSvg.children[len-2].id == "selection"){
        let selection = parentSvg.children[len-2];
        parentSvg.lastChild.remove();
        parentSvg.lastChild.remove();
        createSnapShot();
        del = true;
        let i = 0;
        while(i < parentSvg.children.length){
            console.log(i);
            if(parentSvg.children[i].lastChild != null && parentSvg.children[i].lastChild.tagName == "circle" && isInside(parentSvg.children[i].lastChild, selection)){
                copyList.push({
                    cx: parentSvg.children[i].lastChild.cx.baseVal.value - selection.x.baseVal.value - 19,
                    cy: parentSvg.children[i].lastChild.cy.baseVal.value - selection.y.baseVal.value,
                    rotation: parentSvg.children[i].getAttribute('transform'),
                    id: Number(parentSvg.children[i].dataset.notkey),
                    object: Object.assign(new Object, notDict[Number(parentSvg.children[i].firstChild.id)])
                })
                notClick(parentSvg.children[i].children[1]);
            } else{
                i++;
            }
        }
        del = false;
    }
}

function copy(){
    let parentSvg = document.getElementById('parentSvg');
    let len = parentSvg.children.length;
    if(len > 1 && parentSvg.children[len-2].id == "selection"){
        copyList = [];
        let selection = parentSvg.children[len-2];
        for(let i = 0; i < len; i++){
            if(parentSvg.children[i].lastChild != null && parentSvg.children[i].lastChild.tagName == "circle" && isInside(parentSvg.children[i].lastChild, selection)){
                copyList.push({
                    cx: parentSvg.children[i].lastChild.cx.baseVal.value - selection.x.baseVal.value - 19,
                    cy: parentSvg.children[i].lastChild.cy.baseVal.value - selection.y.baseVal.value,
                    rotation: parentSvg.children[i].getAttribute('transform'),
                    id: Number(parentSvg.children[i].dataset.notkey),
                    object: Object.assign(new Object, notDict[Number(parentSvg.children[i].firstChild.id)])
                })
            }
        }
    }
}

function paste(){
    let parentSvg = document.getElementById("parentSvg");
    let len = parentSvg.children.length;
    if (len > 2 && parentSvg.children[len-2].id == "selection"){
        parentSvg.lastChild.remove();
        parentSvg.lastChild.remove();
    }
    createSnapShot();
    parentSvg.innerHTML += " ";
    document.getElementById('svg').addEventListener('mousedown',(event) => {
        let x = event.clientX - parentSvg.getBoundingClientRect().x;
        let y = event.clientY - parentSvg.getBoundingClientRect().y;
        let len = copyList.length;
        let innerHTML = "";
        let rotationList = [];
        for(let i = 0; i < len; i++){
            let rot  = undefined;
            rotationList.push({radian: 0, x: (x + copyList[i].cx + 67), y: (y + copyList[i].cy)});
            if (copyList[i].rotation != null){
                rot = copyList[i].rotation.split(" ");
                rotationList[i].radian = Number(rot[0].split("(")[1])*Math.PI/180;
                rot[1] = String(x + copyList[i].cx + 67);
                rot[2] = String(y + copyList[i].cy) + ")";
                rot = rot.join(" ");       
            }
            innerHTML += getNotHtml(x + copyList[i].cx, y + copyList[i].cy - 48, rot);
            copyList[i].object.lineTo = [];
            copyList[i].object.lineFrom = [...copyList[i].object.lineFrom];
            copyList[i].object.id = currentKey;
            copyList[i].object.before = true;
            copyList[i].object.after = true;
            copyList[i].object.notUpdated = true;
            currentKey++;
        }
        console.log("rotationlsit",rotationList);
        for(let i = 0; i < len; i++){
            if(copyList[i].object.lineFrom != undefined){
                fromLen = copyList[i].object.lineFrom.length;
            } else {
                fromLen = 0;
            }
            for(let j = 0; j < fromLen; j++){
                let index = binarySearch(copyList[i].object.lineFrom[j], -1, len, Math.floor((len)/2));
                if(index != -1){
                    copyList[index].object.lineTo.push(copyList[i].object.id);
                    let s = {x: (rotationList[index].x + Math.cos(-rotationList[index].radian)*48), y: (rotationList[index].y - Math.sin(-rotationList[index].radian)*48)};
                    let e = {x: (rotationList[i].x - Math.cos(-rotationList[i].radian)*48), y: (rotationList[i].y + Math.sin(-rotationList[i].radian)*48)};
                    innerHTML += '<g id="'+ copyList[index].object.id +" "+ copyList[i].object.id +'" data-to="'+ copyList[i].object.id +'" data-from="'+ copyList[index].object.id +'"><line onclick="wireClick(this)" x1="'+ s.x +'" y1="'+ s.y +'" x2="'+ e.x +'" y2="'+ e.y +'" style="stroke:black;stroke-width:5" />' +
        '<line onclick="wireClick(this)" x1="'+ s.x +'" y1="'+ s.y +'" x2="'+ e.x +'" y2="'+ e.y +'" style="stroke:slategray;stroke-width:3" /></g>'
                    copyList[i].object.lineFrom[j] = copyList[index].object.id;
                } else{
                    copyList[i].object.lineFrom.splice(j, 1);
                    j--;
                    fromLen--;
                }
            }
        }
        parentSvg.innerHTML += innerHTML;
        for(let i = 0; i < len; i++){
            notDict[copyList[i].object.id] = Object.assign(new Object, copyList[i].object);
            if(copyList[i].object.lineFrom != undefined){
                updateList.push(copyList[i].object.id);
            }
        }
        document.getElementById("svg").addEventListener('mousedown', (event) => svgClick(event));
    });
}

function getRotation(rotationList, index, x, y){
    let originX = x - rotationList[index].x;
    let originY = y - rotationList[index].y;
    console.log("len",length);
    console.log("rotx", rotationList[index].x);
    console.log("roty", rotationList[index].y);
    console.log(rotationList[index].radian);
    console.log(Math.atan2(originX,originY));
    let rotation = -rotationList[index].radian;
    return {x: (rotationList[index].x + Math.cos(rotation)*48), y: (rotationList[index].y + Math.sin(rotation)*48)}
}


function binarySearch(target, startIndex, endIndex, nextIndex){
    if (nextIndex == endIndex || nextIndex == startIndex) {
        return -1;
    } else if (copyList[nextIndex].id == target) {
        return nextIndex;
    } else if (copyList[nextIndex].id > target) {
        return binarySearch(target, startIndex, nextIndex, Math.floor((startIndex+nextIndex)/2));
    } else {
        return binarySearch(target, nextIndex, endIndex, Math.ceil((nextIndex+endIndex)/2));
    }
}

function isInside(element, selection){
    let cx = element.cx.baseVal.value;
    let x = selection.x.baseVal.value;
    let width = selection.width.baseVal.value;
    let cy = element.cy.baseVal.value;
    let y = selection.y.baseVal.value;
    let height = selection.height.baseVal.value;
    if(cx >= x && cx <= (x + width) && cy >= y && cy <= (y + height)){
        return true;
    } else{
        return false;
    }
}
function itterate(){
    let updateNow = updateList.slice();
    updateList = [];
    if(deletedList.length > 0){
        while(deletedList.length > 0){
            while(updateNow.indexOf(deletedList[0]) > -1){
                updateNow.splice(updateNow.indexOf(deletedList[0]),1);
            }
            deletedList.shift();
        }
    }
    for (let i = 0; i < updateNow.length; i++){
        let updateNot = notDict[updateNow[i]];
        if(updateNot.notUpdated){
            let state = false;
            for (let i = 0; i < updateNot.lineFrom.length; i++){
                state = state || notDict[updateNot.lineFrom[i]].after;
            }
            if(updateNot.before != !state){
                updateNot.before = !state;
                for(let i = 0; i < updateNot.lineTo.length; i++){
                    updateList.push(updateNot.lineTo[i]);
                }
                document.getElementById(updateNow[i]).style.fill = state ? "midnightblue" : "deepskyblue";
            }
            updateNot.notUpdated = false;
            phaseTwo.push(updateNow[i]);
        }
    }
    for (let i=0; i < phaseTwo.length; i++){
        let updatedNot = notDict[phaseTwo[i]];
        updatedNot.after = updatedNot.before;
        updatedNot.notUpdated = true;
    }
    phaseTwo = []
}

function createSnapShot(){
    if(!del){
        if (snapShot.length == 10){
            snapShot.shift();
        }
        let dictCopy = Object.assign({}, notDict);
        snapShot.push({
            innerHTML: document.getElementById("parentSvg").innerHTML,
            dict: dictCopy,
            update: updateList.slice(),
            key: currentKey
        })
    }
}

function back(){
    if (snapShot.length > 0){
        lastSide = "";
        let lastSnapShot = snapShot.pop();
        if(reSnapShot.length == 10){
            reSnapShot.shift();
        }
        let dictCopy = Object.assign({}, notDict);
        reSnapShot.push({
            innerHTML: document.getElementById("parentSvg").innerHTML,
            dict: dictCopy,
            update: [...updateList],
            key: currentKey
        });
        parentSvg = document.getElementById("parentSvg");
        parentSvg.innerHTML = lastSnapShot.innerHTML;
        notDict = lastSnapShot.dict;
        updateList = lastSnapShot.update;
        currentKey = lastSnapShot.key;
        document.getElementById("svg").addEventListener('mousedown', (event) => svgClick(event));
    }
}

function forward(){
    if (reSnapShot.length > 0){
        lastSide = "";
        let lastSnapShot = reSnapShot.pop();
        if(snapShot.length == 10){
            reSnapShot.shift();
        }
        let dictCopy = Object.assign({}, notDict);
        snapShot.push({
            innerHTML: document.getElementById("parentSvg").innerHTML,
            dict: dictCopy,
            update: [...updateList],
            key: currentKey
        });
        parentSvg = document.getElementById("parentSvg");
        parentSvg.innerHTML = lastSnapShot.innerHTML;
        notDict = lastSnapShot.dict;
        updateList = lastSnapShot.update;
        currentKey = lastSnapShot.key;
        document.getElementById("svg").addEventListener('mousedown', (event) => svgClick(event));
    }
}

function save(){
    let newSave = {
        title: "", 
        innerHTML: document.getElementById("parentSvg").innerHTML,
        notDict: Object.assign(new Object, notDict),
        updateList: [...updateList],
        currentKey: currentKey
    }
    if(window.location.pathname.length > 1){
        newSave.title = window.location.pathname.split("").splice(1).join("");
        fetch(window.location.pathname + "/update",{
            method: 'POST',
            body: JSON.stringify(newSave)
        })
        .then(response => response.json())
        .then(status => {
            if(status.message == "Successful"){
                window.location.replace(newSave.title)
            } else{
                alert("Save Unsuccessful")
            }
        })
    } else {
        newSave.title = window.prompt("What would you like to title your project?","");
        console.log("newsavtitle", newSave.title);
        fetch(newSave.title + "/save",{
            method: 'POST',
            body: JSON.stringify(newSave)
        })
        .then(response => response.json())
        .then(status => {
            if(status.message == "Successful"){
                window.location.replace(window.location.href + newSave.title)
            } else{
                alert("Save Unsuccessful")
            }
        })
    }
}

function lastPage(){
    page--;
    searchDesigns();
}

function nextPage(){
    page++;
    searchDesigns();
}

function searchDesigns(){
    let value = document.getElementById("input").value;
    if (value == ""){
        value = null;
    }
    renderDesigns(value);
}

function viewProject(){
    document.getElementById("workSpace").style.display = "inline";
    document.getElementById("search").style.display = "none";
    document.getElementById("show").style.display = "inline";
    document.getElementById("hide").style.display = "none";
    document.getElementById("save").style.display = "inline";
}

function seeDesigns(){
    page = 0;
    document.getElementById("workSpace").style.display = "none";
    document.getElementById("search").style.display = "inline";
    document.getElementById("show").style.display = "none";
    document.getElementById("hide").style.display = "inline";
    document.getElementById("save").style.display = "none";
    document.getElementById("input").value = "";
    renderDesigns(null);
}

function renderDesigns(search){
    designs = document.getElementById("designs");
    designs.innerHTML = "";
    fetch("circuits/" + page + "/" + search)
    .then(response => response.json())
    .then(projects => {
        if(page > 0){
            document.getElementById("last").style.display = "inline";
        } else{
            document.getElementById("last").style.display = "none";
        }
        if(projects.length == 11){
            document.getElementById("next").style.display = "inline";
        } else{
            document.getElementById("next").style.display = "none";
        }
        let innerHTML = "";
        for(let i = 0; i < Math.min(projects.length,10); i++){
            let svg = document.createElement("svg");
            innerHTML = JSON.parse(projects[i].nots).innerHTML.split("  ").join("").split("</rect>").splice(1,1).join("");
            svg.innerHTML = innerHTML;
            let xMax = 0;
            let xMin = 10000;
            let yMax = 0;
            let yMin = 10000;
            for(let j = 0; j < svg.children.length; j++){
                if(svg.children[j].lastChild != null && svg.children[j].lastChild.tagName == "CIRCLE"){
                    let cx1 = Number(svg.children[j].children[1].getAttribute("cx"));
                    let cy1 = Number(svg.children[j].children[1].getAttribute("cy"));
                    let cx2 = Number(svg.children[j].children[2].getAttribute("cx"));
                    let cy2 = Number(svg.children[j].children[2].getAttribute("cy"));
                    console.log(cx1, cx2, cy1, cy2);
                    let cxMax = Math.max(cx1,cx2);
                    let cxMin = Math.min(cx1,cx2);
                    let cyMax = Math.max(cy1,cy2);
                    let cyMin = Math.min(cy1,cy2);
                    if(cxMax > xMax){
                        xMax = cxMax;
                    } 
                    if(cxMin < xMin){
                        xMin = cxMin;
                    }
                    if(cyMax > yMax){
                        yMax = cyMax;
                    } 
                    if(cyMin < yMin){
                        yMin = cyMin;
                    }
                }
            }
            let boxLength = Math.max(xMax - xMin + 38, yMax - yMin + 134);
            console.log(xMax);
            console.log(xMin);
            console.log(yMax);
            console.log(yMin);
            let viewBox = (xMin - 19) + " " + (yMin - 67) + " " + boxLength + " " + boxLength;
            svg.setAttribute("viewBox", viewBox);
            if(svg.children.length != 0){
                div = document.createElement("div");
                div.setAttribute("id", "design");
                div.append(svg);
                title = document.createElement("h3");
                title.innerHTML = JSON.parse(projects[i].nots).title;
                div.append(title);
                view = document.createElement("button");
                view.innerHTML = "view";
                view.setAttribute("id", "view");
                view.setAttribute("onclick", 'window.location.replace("' + JSON.parse(projects[i].nots).title + '")');
                div.append(view);
                designs.append(div);
            }
        }
        designs.style.display = "grid";
        if(projects.length == 0){
            designs.innerHTML = '<h1 style="text-align: center;">No results found...</h1>'
        }
        designs.innerHTML = designs.innerHTML;
    })
}