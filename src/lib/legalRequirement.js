export default class LegalRequirements{
    constructor() {
        this.dailyHours = {
            min: '01:00',
            max: '12:00'
        }
        this.breakLength = {
            '04:01': '00:15',
            '06:01': '00:30',
            '10:00': '00:45'
        }
        this.weeklyHours = {
            min: '08:00',
            max: {
                'student': '20:00',
                'parttime': '35:00',
                'fulltime': '48:00',
                'overtime': '60:00',
            }
        },
        this.daysOff = {
            min: 1
        }
    }
}