module.exports = remainingApplications;

function remainingApplications(target, sent) {
    if (target < 0 || sent < 0 || sent > target) {
        return 0;
    }

    return target - sent;
}

