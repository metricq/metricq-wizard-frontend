export default ({ app }, inject) => {
  inject(
    'sleep',
    (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  )
}
