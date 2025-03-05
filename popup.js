document.getElementById("submitReport").addEventListener("click", () => {
    let userId = document.getElementById("fbUser").value.trim();
    let reportType = document.getElementById("reportType").value;
    let reportCount = parseInt(document.getElementById("reportCount").value, 10);
    let useProxy = document.getElementById("useProxy").checked;

    if (userId === "") {
        alert("Please enter a Facebook username or ID.");
        return;
    }

    document.getElementById("status").textContent = `Sending ${reportCount} report(s)...`;

    chrome.runtime.sendMessage({
        action: "sendReport",
        userId,
        reportType,
        reportCount,
        useProxy
    });
});

// Listen for updates from background.js
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateStatus") {
        document.getElementById("status").textContent = `Reports Sent: ${message.reportsSent}/${message.reportCount}`;
    }
});
