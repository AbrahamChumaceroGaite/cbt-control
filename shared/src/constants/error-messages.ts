import { ErrorCode } from '../types/error-codes'

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.ACTION_NAME_TOO_SHORT]:    'Action name must be at least 2 characters',
  [ErrorCode.ACTION_COINS_ZERO]:        'Action coins cannot be zero',
  [ErrorCode.ACTION_NO_SCOPE]:          'Action must apply to class or student',
  [ErrorCode.STUDENT_NAME_REQUIRED]:    'Student name is required',
  [ErrorCode.STUDENT_COURSE_REQUIRED]:  'Student course is required',
  [ErrorCode.STUDENT_COINS_NEGATIVE]:   'Student coins cannot be negative',
  [ErrorCode.GROUP_NAME_TOO_SHORT]:     'Group name must be at least 2 characters',
  [ErrorCode.GROUP_COURSE_REQUIRED]:    'Group course is required',
  [ErrorCode.REWARD_NAME_TOO_SHORT]:    'Reward name must be at least 2 characters',
  [ErrorCode.REWARD_COINS_ZERO]:        'Required coins must be greater than zero',
  [ErrorCode.REWARD_DISCOUNT_INVALID]:  'Discount must be between 0 and 100',
  [ErrorCode.COURSE_NAME_TOO_SHORT]:    'Course name must be at least 2 characters',
  [ErrorCode.COURSE_LEVEL_REQUIRED]:    'Course level is required',
  [ErrorCode.COURSE_PARALLEL_REQUIRED]: 'Course parallel is required',
  [ErrorCode.USER_CODE_REQUIRED]:       'User code is required',
  [ErrorCode.USER_NAME_REQUIRED]:       'Full name is required',
}
