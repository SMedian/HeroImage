'use strict';

//
//  PagingParams.swift
//  StatementMVPOne
//
//  Created by Lincoln Daniel on 10/1/16.
//  Copyright © 2016 gzwiab. All rights reserved.
//

const PagingParamsSortType = {
    REVERSE_CRON: -1,
    CRON: 1,
    RANK_CRON: 2,
    RANK_CRON_DEC: 3,
    ALPHA: 4
}

function PagingParams(_sort = PagingParamsSortType["REVERSE_CRON"], opts = {}) {

    const params = this
    const name = opts.name
    const sort = _sort
    var updates = 0
    var remainder = 10
    var limit = opts.limit || 10
    var from

    if(sort == PagingParamsSortType["REVERSE_CRON"]) {
        from = PagingParams.getCurrentMillis()
    } else if(sort == PagingParamsSortType["ALPHA"]) {
        from = 'a'
    } else if(sort == PagingParamsSortType["RANK_CRON_DEC"]) {
        from = Number.MAX_SAFE_INTEGER
    } else {
        from = 0
    }
    
    this.update = function(dbPagingParams) {
        if (!dbPagingParams) {
            if (limit > 0) { this.updates += 1 }
            //prevent loading more if we encounter a null paging params
            limit = 0
            remainder = 0
            return
        }
        const _from = dbPagingParams["from"]
        
        switch(sort) {
            case PagingParamsSortType["CRON"]:
                if (PagingParams.dateIsNewer(_from, from)) from = _from 
                break;
            case PagingParamsSortType["RANK_CRON"]:
                if (PagingParams.isGreater(_from, from)) from = _from
                break;
            case PagingParamsSortType["RANK_CRON_DEC"]:
                if (PagingParams.isLesser(_from, from)) from = _from
                break;
            case PagingParamsSortType["ALPHA"]:
                if (PagingParams.isGreaterAlpha(_from, from)) from = _from
                break;
            case PagingParamsSortType["REVERSE_CRON"]:
                if (PagingParams.dateIsOlder(_from, from)) from = _from
                break;
        }
        
        limit = (!opts.limit && dbPagingParams["limit"] || dbPagingParams["limit"] >= opts.limit && dbPagingParams["limit"]) || 20
        remainder = (dbPagingParams["remainder"])
        updates += 1
    }

    this.getLimit = function() {
        return limit
    }

    this.getFrom = function() {
        return from
    }

    this.getRemainder = function() {
        return remainder
    }

    this.getUpdates = function() {
        return updates
    }
    
    this.getFromKey = function() {
        var key = "from"
        if (this.name != nil) {
            key = "from_\(this.name!)"
        }
        return key
    }
    
    this.getLimitKey = function() {
        var key = "limit"
        if (this.name != nil) {
            key = "limit_\(this.name!)"
        }
        return key
    }
    
    this.canLoadMore = function() {
        return remainder > 0
    }   
}

PagingParams.getCurrentMillis = function() {
    return new Date().getTime()
}

// Sort dates ascending is Oldest date first. Older (lesser) dates up top. 1 in mongodb sort
// ----
// Sort dates descending is Newest date first. Newer (greater) dates up top. -1 in mongodb sort
// ----
// For cron, from the top, we start at the oldest date and every date after that is newer.
// For reverse cron, from the top, we start at the newest date and every date after that is older.
// ----
// Cron sort is first come, first out
// ReverseCron sort is last come, first out

/**
 * For RankCron sort
 * @return true if number1 is greater (better) than number2
 * false if number1 is less (lesser) than number2
 */
PagingParams.isGreaterAlpha = function(word1, word2) {
    return (word1 + '').toLowerCase() > (word2 + '').toLowerCase()
}

/**
 * For RankCron sort
 * @return true if number1 is greater (better) than number2
 * false if number1 is less (lesser) than number2
 */
PagingParams.isGreater = function(number1, number2) {
    return number1 > number2
}

/**
 * For RankCron sort
 * @return true if number1 is lesser (lower) than number2
 * false if number1 is greater (better) than number2
 */
PagingParams.isLesser = function(number1, number2) {
    return number1 < number2
}

/**
 * For Cron sort
 * @return true if date1 is greater (newer) than date2
 * false if date1 is less (older) than date2
 */
PagingParams.dateIsNewer = function(date1, date2) {
    return date1 > date2
}

/**
 * For Cron ReverseCron sort
 * @return true if date1 is less (older) than date2
 * false if date1 is greater (newer) than date2
 */
PagingParams.dateIsOlder = function(date1, date2) {
    return date1 < date2
}
