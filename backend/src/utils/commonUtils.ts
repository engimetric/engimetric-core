import moment from 'moment';

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
