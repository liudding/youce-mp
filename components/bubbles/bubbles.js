// components/bubbles/bubbles.js
Component({

  properties: {
    count: {
      type: Number,
      default: 4
    },
    // ['A', 'B', 'C']
    data: {
      type: Array,
    }
  },


  data: {
    bubbles: ['A', 'B', 'C'],
    picked: [1, 2]
  },

  methods: {

  }
})
