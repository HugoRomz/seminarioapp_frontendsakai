import { generateClasses } from '@formkit/themes'

const config = {
  config: {
    classes: generateClasses({
      global: {
        wrapper: 'space-y-2 mb-3',
        message: 'bg-red-500 text-white text-center text-xs font-semibold uppercase p-2 my-2',
        label: 'block mb-1 font-bold text-sm text-unachBlue',
        input:
          'bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-unachBlue focus:border-unachBlue block w-full p-2.5'
      },
      submit: {
        input:
          '$reset w-full text-white bg-unachBlue hover:bg-primary-700 font-bold rounded-lg text-sm px-5 py-2.5 text-center hover:bg-sky-700 mt-5'
      }
    })
  }
}

export default config
