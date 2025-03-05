async function getProxies() {
    try {
        let response1 = await fetch("https://tcsdemonic.rf.gd/tcs/proxies2.php");
        let response2 = await fetch("https://tcsdemonic.rf.gd/tcs/proxies3.php");

        let proxies1 = await response1.text();
        let proxies2 = await response2.text();

        let proxyList = proxies1.split("\n").concat(proxies2.split("\n")).filter(p => p.trim() !== "");
        return proxyList;
    } catch (error) {
        console.error("Error fetching proxies:", error);
        return [];
    }
}

async function getFacebookCookies() {
    return new Promise((resolve) => {
        chrome.cookies.getAll({ domain: "facebook.com" }, (cookies) => {
            let fbCookies = cookies.map(c => `${c.name}=${c.value}`).join("; ");
            resolve(fbCookies);
        });
    });
}

async function sendReport(userId, reportType, reportCount, useProxy) {
    let proxies = useProxy ? await getProxies() : [];
    let fbCookies = await getFacebookCookies();
    let reportsSent = 0;

    for (let i = 0; i < reportCount; i++) {
        let proxy = useProxy && proxies.length > 0 ? proxies[Math.floor(Math.random() * proxies.length)] : null;

        try {
            let headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.3",
                "Cookie": fbCookies
            };
            if (proxy) headers["X-Forwarded-For"] = proxy;

            await fetch(`https://www.facebook.com/${userId}/report/`, {
                method: "POST",
                headers: headers,
                body: `user_id=${userId}&reason=${reportType}`
            });

            reportsSent++;

            chrome.runtime.sendMessage({
                action: "updateStatus",
                reportsSent,
                reportCount
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`Report #${i + 1} failed:`, error);
        }
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "sendReport") {
        sendReport(message.userId, message.reportType, message.reportCount, message.useProxy);
    }
});
