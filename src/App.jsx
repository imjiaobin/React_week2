import { useState, useEffect } from 'react'
import axios from 'axios'
import Products from './Products'
import LoginForm from './loginForm'
import './App.css'

const API_BASE = "https://ec-course-api.hexschool.io/v2";
const apiPath = 'jiaobin';
// 1. 安裝axios
// 2. 完成 handleLogin() : 登入function
// 3. 完成 checkLogin()  : 驗證是否登入成功function 
// 4. 完成 getProducts() : 取得商品資料function
// 5. token 改用 useEffect()


function App() {

  // 提交表單資料
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [isAuth, setIsAuth] = useState(false);          // 登入
  const [products, setProducts] = useState([]);         // 商品列表
  const [tempProduct, setTempProduct] = useState(null); // 顯示一筆商品狀態
  
  // token 狀態
  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (!token){
      // console.log('沒有找到token, 請重新登入!')
      return
    }

    axios.defaults.headers.common.Authorization = token;

    (async () => {
      try {
        await checkLogin();   // 驗整登入
        setIsAuth(true);      // 通過驗證
        await getProducts();  // 取得商品列表
      } catch (err) {
        console.dir(err)
        setIsAuth(false);                                   // 未通過驗證
        delete axios.defaults.headers.common.Authorization; // 確認 header預設的 token 沒有資料
        document.cookie = "hexToken=; expires=;";           // 確認 cookie 資訊被清掉
      }
    })();
  }, []);

  // input 狀態綁定
  function handleInputChange(e){
    const {name, value} = e.target;
    setFormData( 
      {
        ...formData,
        [name]: value
      }
     )
  }

  // 登入
  async function handleLogin(e){
     e.preventDefault();
    try
    {
      const res = await axios.post( `${API_BASE}/admin/signin`, formData);
      const {token, expired} = res.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common.Authorization = `${token}`;

      setIsAuth(true); // 修改驗證狀態為 登入成功
      getProducts();   // 重新渲染列表
        
    }
    catch(err)
    {
      console.dir(err);
      setIsAuth(false); // 修改驗證狀態為 登入失敗
    }
    finally{
      console.log('登入function執行完畢')
    }
  }

  // 檢查是否登入
  async function checkLogin(){
    // try
    // {
    //   await axios.post(`${API_BASE}/api/user/check`);
    // }
    // catch(err)
    // {
    //   console.dir(err);
    // }
    // 改成以下, 給 useEffect 接
    const res = await axios.post(`${API_BASE}/api/user/check`);
    return res;
  }

  // 取得商品列表
  async function getProducts(){
      // try{
          
      //     const res = await axios.get(`${API_BASE}/api/${apiPath}/admin/products`);
          
      //     console.log(res);
      // }
      // catch(err){
      //     console.dir(err);
      // }
      const res = await axios.get(`${API_BASE}/api/${apiPath}/admin/products`);
      const productList = res.data.products;
      setProducts(productList);

      return productList
  }

  return (
    <>
      {isAuth ? (
        <Products products={products} tempProduct={tempProduct} onSelectProduct={setTempProduct}/>
      ) : (
        <LoginForm user={formData} handleLogin={handleLogin} handleInputChange={handleInputChange} />
      )}
    </>
  );
}

export default App
