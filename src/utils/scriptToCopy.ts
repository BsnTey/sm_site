export const scriptToCopy = (keys: string[]) => {
    return `let index = 0;
const promoCodes = [\"${keys.join('", "')}\"];

const authToken = localStorage.getItem('authToken');

function applyPromoCode() {
    if (index >= promoCodes.length) {
        return;
    }

    const promoCode = promoCodes[index];

    const request = new Request('https://api.hamsterkombatgame.io/clicker/apply-promo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
            "promoCode": promoCode
        })
    });

    fetch(request)
        .then(response => response.json())
        .then(data => console.log(data))
        .catch((error) => console.error('Error:', error));

    index++;

    if (index < promoCodes.length) {
        setTimeout(applyPromoCode, 5 * 60 * 1000);
    }
}

applyPromoCode();`;
};