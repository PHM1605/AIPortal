import React from 'react'

const data = [
  {product:"milk", count:5},
  {product:"clothes", count:10}
]

const Table = (props) => {
  return (
    <div className="mx-4">
      <table>
        <tr>
          <th>Product</th>
          <th>Count</th>
        </tr>
        {
          props.numeric.map((val, idx)=>{
            return (
              <tr key={idx}>
                <td>{val.product}</td>
                <td>{val.count}</td>
              </tr>
            )
          })
        }
      </table>
    </div>
    
  )
}

export default Table