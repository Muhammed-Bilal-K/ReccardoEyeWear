let timeleft = 59
let elem = document.getElementById('otp-timer');
let timein = setInterval(countdown,1000)

function countdown(){
    if(timeleft==-1){
        document.getElementById('resend').style.display='block';
        elem.innerHTML = ' ';
        clearInterval(timein);
    }else{
        elem.innerHTML= timeleft + 'seconds remaining';
        timeleft--;
    }
}



