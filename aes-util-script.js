if (!window.atob) {
	var tableStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var table = tableStr.split("");

	window.atob = function (base64) {
		if (/(=[^=]+|={3,})$/.test(base64)) throw new Error("String contains an invalid character");
		base64 = base64.replace(/=/g, "");
		var n = base64.length & 3;
		if (n === 1) throw new Error("String contains an invalid character");
		for (var i = 0, j = 0, len = base64.length / 4, bin = []; i < len; ++i) {
			var a = tableStr.indexOf(base64[j++] || "A"), b = tableStr.indexOf(base64[j++] || "A");
			var c = tableStr.indexOf(base64[j++] || "A"), d = tableStr.indexOf(base64[j++] || "A");
			if ((a | b | c | d) < 0) throw new Error("String contains an invalid character");
			bin[bin.length] = ((a << 2) | (b >> 4)) & 255;
			bin[bin.length] = ((b << 4) | (c >> 2)) & 255;
			bin[bin.length] = ((c << 6) | d) & 255;
		};
		return String.fromCharCode.apply(null, bin).substr(0, bin.length + n - 4);
	};

	window.btoa = function (bin) {
		for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
			var a = bin.charCodeAt(j++), b = bin.charCodeAt(j++), c = bin.charCodeAt(j++);
			if ((a | b | c) > 255) throw new Error("String contains an invalid character");
			base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
				(isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) + (isNaN(b + c) ? "=" : table[c & 63]);
		}
		return base64.join("");
	};
}

function hexToBase64(str) {
	return btoa(String.fromCharCode.apply(null,
			str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
	);
}

function base64ToHex(str) {
	for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
		var tmp = bin.charCodeAt(i).toString(16);
		if (tmp.length === 1) tmp = "0" + tmp;
		hex[hex.length] = tmp;
	}
	return hex.join("");
}

function getEle(ele) {
	return document.getElementById(ele);
}

function setVisibility(target, checkbox) {
	getEle(target).type = getEle(checkbox).checked ? "text" : "password";
}

function doIt() {
	var radios = document.getElementsByName('mode');
	for (var i = 0, length = radios.length; i < length; i++)
		if (radios[i].checked) {
			if (radios[i].value === "true") encrypt(); else decrypt();
			break;
	}
}

function encrypt() {
	if (getEle("to-crypt").value.length === 0) {
		alert("Please enter something to encrypt.");
		return;
	}
	if (getEle("crypt-password").value.length != 16) {
		alert("The password must be exactly 16 characters.");
		return;
	}
	getEle("out").innerHTML = hexToBase64(aesjs.utils.hex.fromBytes(new aesjs.ModeOfOperation.ctr(aesjs.utils.utf8.toBytes(getEle("crypt-password").value)).encrypt(aesjs.utils.utf8.toBytes(getEle("to-crypt").value))));
	getEle("button-copy").style="display:block";
}

function decrypt() {
	if (getEle("to-crypt").value.length === 0) {
		alert("Please enter something to decrypt.");
		return;
	}
	if (getEle("crypt-password").value.length != 16) {
		alert("The password must be exactly 16 characters.");
		return;
	}
	getEle("out").innerHTML = aesjs.utils.utf8.fromBytes(new aesjs.ModeOfOperation.ctr(aesjs.utils.utf8.toBytes(getEle("crypt-password").value)).decrypt(aesjs.utils.hex.toBytes(base64ToHex(getEle("to-crypt").value)))).replace(/</g, "&lt;").replace(/>/g, "&gt;");
	getEle("button-copy").style="display:block";
}

function selectEle(ele) {
    node = document.getElementById(ele);

    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

function copyResult() {
	selectEle("out");
	document.execCommand('copy');
	selectEle('empty');
}