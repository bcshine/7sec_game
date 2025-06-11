// 게임에서 사용할 변수들을 먼저 만들어둬요
let startTime; // 게임을 시작한 시간을 기억해둘 변수에요
let timerInterval; // 시계가 움직이는 것을 조절하는 변수에요
let isRunning = false; // 지금 게임이 진행중인지 확인하는 변수에요
let streakCount = 0; // 연속으로 성공한 횟수를 세는 변수에요
let bonusRound = false; // 지금이 보너스 라운드인지 확인하는 변수에요
let roundCounter = 0; // 총 몇 번째 라운드인지 세는 변수에요
let gameState = 'start'; // 게임이 어떤 상태인지 기억하는 변수에요 (시작/정지/다시하기)

// HTML에서 필요한 요소들을 찾아서 변수에 저장해둬요
const timerDisplay = document.querySelector('.timer'); // 시간을 보여주는 숫자 화면이에요
const gameButton = document.getElementById('gameBtn'); // 게임을 조작하는 메인 버튼이에요
const resultDisplay = document.getElementById('result'); // 성공/실패 결과를 보여주는 곳이에요
const bonusDisplay = document.getElementById('bonus'); // 보너스 메시지를 보여주는 곳이에요
const streakDisplay = document.getElementById('streak'); // 연속 성공을 보여주는 곳이에요
const streakCountDisplay = document.getElementById('streakCount'); // 연속 성공 횟수 숫자를 보여주는 곳이에요
const shareContainer = document.getElementById('shareContainer'); // 공유 버튼이 들어있는 상자에요
const shareButton = document.getElementById('shareBtn'); // SNS 공유 버튼이에요
const rankingList = document.getElementById('rankingList'); // 랭킹 목록을 보여주는 곳이에요
const fireworksContainer = document.getElementById('fireworks'); // 폭죽 효과를 보여주는 곳이에요

// 1등부터 5등까지 랭킹을 저장할 배열을 만들어요
let rankings = [];

// 웹페이지가 모두 로드되면 실행되는 함수에요
document.addEventListener('DOMContentLoaded', () => {
    // 컴퓨터에 저장된 랭킹 데이터가 있는지 확인해요
    const savedRankings = localStorage.getItem('sevenSecRankings');
    if (savedRankings) {
        // 저장된 랭킹이 있으면 불러와서 사용해요
        rankings = JSON.parse(savedRankings);
    }
    // 랭킹을 화면에 보여줘요 (저장된 랭킹이 없어도 안내 메시지를 보여줘요)
    updateRankingDisplay();
});

// 메인 게임 버튼을 클릭했을 때 실행되는 함수에요
gameButton.addEventListener('click', () => {
    // 버튼의 현재 상태에 따라 다른 일을 해요
    if (gameState === 'start') {
        startGame(); // '시작' 상태면 게임을 시작해요
    } else if (gameState === 'stop') {
        stopGame(); // '정지' 상태면 게임을 멈춰요
    } else if (gameState === 'reset') {
        resetGame(); // '다시하기' 상태면 게임을 처음부터 다시 해요
    }
});

// 공유 버튼을 클릭했을 때 실행되는 함수에요
shareButton.addEventListener('click', () => {
    shareResult(); // 결과를 SNS에 공유해요
});

// 버튼의 모양과 글자를 바꿔주는 함수에요
function updateButtonState(state) {
    gameState = state; // 게임 상태를 새로 설정해요
    gameButton.setAttribute('data-state', state); // HTML 속성을 바꿔서 색깔이 변하게 해요
    
    // 상태에 따라 버튼에 쓰인 글자를 바꿔요
    if (state === 'start') {
        gameButton.textContent = '시작'; // 시작 버튼으로 바꿔요
    } else if (state === 'stop') {
        gameButton.textContent = '정지'; // 정지 버튼으로 바꿔요
    } else if (state === 'reset') {
        gameButton.textContent = '다시하기'; // 다시하기 버튼으로 바꿔요
    }
}

// 폭죽을 터뜨리는 함수에요
function triggerFireworks() {
    // 폭죽 효과를 보여줘요
    fireworksContainer.classList.remove('hidden');
    
    // 모든 큰 폭죽에 새로운 애니메이션을 시작해요
    const bigFireworks = fireworksContainer.querySelectorAll('.big-firework');
    bigFireworks.forEach(firework => {
        // 기존 애니메이션을 초기화해요
        firework.style.animation = 'none';
        // 잠깐 기다린 후 새로운 애니메이션을 시작해요
        setTimeout(() => {
            firework.style.animation = 'mega-explode 2s ease-out forwards';
        }, 10);
    });
    
    // 모든 파티클에 새로운 애니메이션을 시작해요
    const particles = fireworksContainer.querySelectorAll('.particle');
    particles.forEach(particle => {
        // 기존 애니메이션을 초기화해요
        particle.style.animation = 'none';
        // 잠깐 기다린 후 새로운 애니메이션을 시작해요
        setTimeout(() => {
            particle.style.animation = 'particle-burst 1.5s ease-out forwards';
        }, 10);
    });
    
    // 모든 별에 새로운 애니메이션을 시작해요
    const stars = fireworksContainer.querySelectorAll('.star');
    stars.forEach(star => {
        // 기존 애니메이션을 초기화해요
        star.style.animation = 'none';
        // 잠깐 기다린 후 새로운 애니메이션을 시작해요
        setTimeout(() => {
            star.style.animation = 'star-twinkle 2.5s ease-out forwards';
        }, 10);
    });
    
    // 2.5초 후에 폭죽을 숨겨요 (별이 가장 오래 지속되므로)
    setTimeout(() => {
        fireworksContainer.classList.add('hidden');
    }, 2500);
}

// 게임을 시작하는 함수에요
function startGame() {
    // 이미 게임이 진행중이면 아무것도 하지 않아요
    if (isRunning) return;
    
    // 라운드 횟수를 하나 늘려요
    roundCounter++;
    
    // 7번째 라운드마다 보너스 라운드로 만들어요
    bonusRound = (roundCounter % 7 === 0);
    
    // 보너스 라운드인지 화면에 알려줘요
    if (bonusRound) {
        bonusDisplay.textContent = '🎉 보너스 라운드! 성공 시 보상이 두 배! 🎉';
        bonusDisplay.classList.add('bonus'); // 노란색 배경을 추가해요
        bonusDisplay.classList.remove('hidden'); // 숨겨진 상태를 해제해서 보이게 해요
    } else {
        bonusDisplay.classList.add('hidden'); // 보너스가 아니면 숨겨요
    }
    
    // 게임 진행 상태로 바꿔요
    isRunning = true;
    startTime = Date.now(); // 지금 시간을 기록해둬요
    
    // 버튼을 정지 버튼으로 바꿔요
    updateButtonState('stop');
    
    // 이전 결과 메시지를 숨겨요
    resultDisplay.classList.add('hidden');
    
    // 0.01초마다 시계를 업데이트하는 타이머를 시작해요
    timerInterval = setInterval(updateTimer, 10);
}

// 시계 숫자를 계속 업데이트하는 함수에요
function updateTimer() {
    // 시작한 시간부터 지금까지 몇 초가 지났는지 계산해요
    const elapsedTime = (Date.now() - startTime) / 1000;
    // 소수점 둘째 자리까지만 보여줘요
    timerDisplay.textContent = elapsedTime.toFixed(2);
}

// 게임을 정지하는 함수에요
function stopGame() {
    // 게임이 진행중이 아니면 아무것도 하지 않아요
    if (!isRunning) return;
    
    // 타이머를 멈춰요
    clearInterval(timerInterval);
    isRunning = false; // 게임이 끝났다고 표시해요
    
    // 버튼을 다시하기 버튼으로 바꿔요
    updateButtonState('reset');
    
    // 최종 시간을 가져와요
    const finalTime = parseFloat(timerDisplay.textContent);
    
    // 게임 결과가 성공인지 실패인지 확인하고 보여줘요
    evaluateResult(finalTime);
}

// 게임 결과를 확인하고 점수를 매기는 함수에요
function evaluateResult(time) {
    // 이전 결과 스타일을 모두 지워요
    resultDisplay.classList.remove('hidden', 'success', 'fail');
    let resultMessage = ''; // 결과 메시지를 저장할 변수에요
    let isSuccess = false; // 성공했는지 확인하는 변수에요
    let showFireworks = false; // 폭죽을 보여줄지 확인하는 변수에요
    
    // 정확히 7초에 가까운지 확인해요 (6.99초부터 7.01초까지)
    if (time >= 6.99 && time <= 7.01) {
        resultMessage = `대성공! 정확히 ${time}초!`; // 성공 메시지를 만들어요
        resultDisplay.classList.add('success'); // 초록색 배경을 추가해요
        isSuccess = true; // 성공했다고 표시해요
        showFireworks = true; // 폭죽을 보여줄 거에요
        streakCount++; // 연속 성공 횟수를 하나 늘려요
        
        // 보너스 라운드에서 성공하면 연속 성공을 하나 더 추가해요
        if (bonusRound) {
            streakCount++;
        }
    } 
    // 아슬아슬 보너스 (6.95초부터 7.05초까지)
    else if (time >= 6.95 && time <= 7.05) {
        resultMessage = `아슬아슬! ${time}초! 근접 보너스!`; // 근접 보너스 메시지를 만들어요
        resultDisplay.classList.add('success'); // 초록색 배경을 추가해요
        isSuccess = true; // 성공했다고 표시해요
        showFireworks = true; // 폭죽을 보여줄 거에요
        streakCount++; // 연속 성공 횟수를 하나 늘려요
    }
    // 1초 범위 내 (6초~8초 사이)에 들어왔는지 확인해요
    else if (time >= 6.0 && time <= 8.0) {
        resultMessage = `좋아요! ${time}초! 1초 범위 달성! 🎆`; // 1초 범위 메시지를 만들어요
        resultDisplay.classList.add('success'); // 초록색 배경을 추가해요
        isSuccess = true; // 성공했다고 표시해요
        showFireworks = true; // 폭죽을 보여줄 거에요
        streakCount++; // 연속 성공 횟수를 하나 늘려요
    }
    // 실패한 경우
    else {
        // 7초와 얼마나 차이가 나는지 계산해서 메시지를 만들어요
        resultMessage = `아쉽네요! ${time}초! (7초와의 차이: ${Math.abs(7 - time).toFixed(2)}초)`;
        resultDisplay.classList.add('fail'); // 빨간색 배경을 추가해요
        isSuccess = false; // 실패했다고 표시해요
        streakCount = 0; // 연속 성공 횟수를 0으로 초기화해요
    }
    
    // 결과 메시지를 화면에 보여줘요
    resultDisplay.textContent = resultMessage;
    
    // 폭죽을 보여줄 경우 폭죽 효과를 실행해요
    if (showFireworks) {
        triggerFireworks();
    }
    
    // 성공했으면 공유 버튼을 보여줘요
    if (isSuccess) {
        shareContainer.classList.remove('hidden');
    } else {
        shareContainer.classList.add('hidden'); // 실패했으면 공유 버튼을 숨겨요
    }
    
    // 연속 성공 횟수가 0보다 크면 화면에 보여줘요
    if (streakCount > 0) {
        streakDisplay.classList.remove('hidden');
        streakCountDisplay.textContent = streakCount; // 연속 성공 횟수를 업데이트해요
    } else {
        streakDisplay.classList.add('hidden'); // 연속 성공이 없으면 숨겨요
    }
    
    // 모든 시도 결과를 랭킹에 추가해요 (성공/실패 상관없이)
    addToRankings(time, isSuccess);
}

// 게임을 처음 상태로 되돌리는 함수에요
function resetGame() {
    // 타이머를 멈춰요
    clearInterval(timerInterval);
    isRunning = false; // 게임이 끝났다고 표시해요
    
    // 시계를 0.00으로 되돌려요
    timerDisplay.textContent = '0.00';
    
    // 버튼을 시작 버튼으로 바꿔요
    updateButtonState('start');
    
    // 모든 결과 메시지를 숨겨요
    resultDisplay.classList.add('hidden');
    bonusDisplay.classList.add('hidden');
    
    // 공유 버튼도 숨겨요
    shareContainer.classList.add('hidden');
    
    // 폭죽도 숨겨요
    fireworksContainer.classList.add('hidden');
}

// 결과를 SNS에 공유하는 함수에요
function shareResult() {
    // 공유할 메시지를 만들어요
    const shareText = `7초 게임에서 ${timerDisplay.textContent}초를 기록했어요! 연속 성공: ${streakCount}회`;
    
    // 스마트폰에서 공유 기능이 있으면 사용해요
    if (navigator.share) {
        navigator.share({
            title: '7초 게임 결과', // 공유할 제목이에요
            text: shareText, // 공유할 내용이에요
            url: window.location.href // 현재 웹페이지 주소를 같이 공유해요
        })
        .then(() => {
            // 공유가 성공하면 보너스를 줘요
            streakCount++; // 연속 성공을 하나 더 추가해요
            streakCountDisplay.textContent = streakCount; // 화면에 업데이트해요
            bonusDisplay.textContent = '🎁 공유 보너스! 연속 성공 +1'; // 보너스 메시지를 보여줘요
            bonusDisplay.classList.add('bonus'); // 노란색 배경을 추가해요
            bonusDisplay.classList.remove('hidden'); // 숨겨진 상태를 해제해요
        })
        .catch(error => console.log('공유 실패:', error)); // 공유가 실패하면 에러를 출력해요
    } else {
        // 공유 기능이 없으면 클립보드에 복사해요
        const tempInput = document.createElement('textarea'); // 임시로 텍스트 입력창을 만들어요
        tempInput.value = shareText; // 공유할 내용을 넣어요
        document.body.appendChild(tempInput); // 웹페이지에 추가해요
        tempInput.select(); // 모든 텍스트를 선택해요
        document.execCommand('copy'); // 클립보드에 복사해요
        document.body.removeChild(tempInput); // 임시 입력창을 삭제해요
        
        // 복사가 완료되었다고 알려줘요
        alert('결과가 클립보드에 복사되었어요! SNS에 붙여넣기 하세요.');
        
        // 공유 보너스를 줘요
        streakCount++; // 연속 성공을 하나 더 추가해요
        streakCountDisplay.textContent = streakCount; // 화면에 업데이트해요
        bonusDisplay.textContent = '🎁 공유 보너스! 연속 성공 +1'; // 보너스 메시지를 보여줘요
        bonusDisplay.classList.add('bonus'); // 노란색 배경을 추가해요
        bonusDisplay.classList.remove('hidden'); // 숨겨진 상태를 해제해요
    }
}

// 랭킹에 새로운 점수를 추가하는 함수에요
function addToRankings(time, isSuccess) {
    // 정확도를 계산해요 (7초에서 얼마나 가까운지)
    const accuracy = 1 - Math.abs(7 - time) / 7;
    const score = {
        time: time.toFixed(2), // 시간을 소수점 둘째 자리까지 저장해요
        accuracy: (accuracy * 100).toFixed(2), // 정확도를 퍼센트로 바꿔서 저장해요
        date: new Date().toLocaleDateString(), // 오늘 날짜를 저장해요
        success: isSuccess // 성공/실패 여부를 저장해요
    };
    
    // 새로운 점수를 랭킹 목록에 추가해요
    rankings.push(score);
    
    // 정확도가 높은 순서대로 정렬해요
    rankings.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));
    
    // 10등까지만 남기고 나머지는 삭제해요 (더 많은 기록을 보여주기 위해)
    if (rankings.length > 10) {
        rankings = rankings.slice(0, 10);
    }
    
    // 컴퓨터에 랭킹을 저장해요 (다음에 게임을 켜도 기억하기 위해서)
    localStorage.setItem('sevenSecRankings', JSON.stringify(rankings));
    
    // 화면에 랭킹을 다시 보여줘요
    updateRankingDisplay();
}

// 랭킹을 화면에 보여주는 함수에요
function updateRankingDisplay() {
    // 기존 랭킹 목록을 모두 지워요
    rankingList.innerHTML = '';
    
    // 각각의 랭킹을 하나씩 화면에 추가해요 (상위 5개만 표시)
    const displayRankings = rankings.slice(0, 5);
    displayRankings.forEach((score, index) => {
        const li = document.createElement('li'); // 새로운 목록 항목을 만들어요
        // 성공/실패 표시와 함께 점수 정보를 써넣어요
        const successIcon = score.success ? '✅' : '❌';
        li.textContent = `${successIcon} ${score.time}초 (정확도: ${score.accuracy}%) - ${score.date}`;
        rankingList.appendChild(li); // 랭킹 목록에 추가해요
    });
    
    // 랭킹이 하나도 없으면 안내 메시지를 보여줘요
    if (rankings.length === 0) {
        const li = document.createElement('li'); // 새로운 목록 항목을 만들어요
        li.textContent = '아직 기록이 없습니다. 도전해보세요!'; // 안내 메시지를 써넣어요
        li.style.color = '#999'; // 글자 색을 연한 회색으로 해요
        li.style.fontStyle = 'italic'; // 글자를 기울임체로 해요
        rankingList.appendChild(li); // 랭킹 목록에 추가해요
    }
} 