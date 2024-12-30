import moment from 'moment';

/**
 * Past 12 Months Array of Objects
 * @description An array of objects containing the month, start date, and end date for the past 12 months
 * @example
 * ```javascript
 * console.log(past12Months);
 * // Output: [
 * //   { month: '2021-08', startDate: '2021-08-01', endDate: '2021-08-31' },
 * //   { month: '2021-07', startDate: '2021-07-01', endDate: '2021-07-31' },
 * //   ...
 * //   { month: '2020-09', startDate: '2020-09-01', endDate: '2020-09-30' }
 * // ]
 * ```
 * @returns An array of objects containing the month, start date, and end date for the past 12 months
 */
export const past12Months: { month: string; startDate: string; endDate: string }[] = Array.from(
    { length: 12 },
    (_, i) => {
        const month = moment().subtract(i, 'months');
        return {
            month: month.format('YYYY-MM'),
            startDate: month.startOf('month').format('YYYY-MM-DD'),
            endDate: month.endOf('month').format('YYYY-MM-DD'),
        };
    },
);
