import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Image, ListGroup, Modal, Nav, Row, Spinner } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';

const ProductSearchPage = () => {
  const [productName, setProductName] = useState('');
  const [productNumber, setProductNumber] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const history = useHistory(); 
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/products');
        setProducts(response.data);
        setError('');
      } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
        setError('Не удалось загрузить список продуктов');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!productName || !productNumber || !productImage) {
      setError('Пожалуйста, заполните все поля и выберите изображение');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('name', productName);
      formData.append('number', productNumber);
      formData.append('image', productImage);

      const response = await axios.post('http://localhost:8080/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      setSuccess('Продукт успешно добавлен');
      setProducts([...products, response.data.product]);
      setProductName('');
      setProductNumber('');
      setProductImage(null);
      document.getElementById('formFile').value = '';
      
      setShowModal(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Ошибка при добавлении продукта:', error);
      setError('Не удалось добавить продукт. Пожалуйста, проверьте данные и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      setDeleteLoading(true);
      
      await axios.delete(`http://localhost:8080/products/${productToDelete.id}`, {
        withCredentials: true
      });
      
      setProducts(products.filter(product => product.id !== productToDelete.id));
      
      if (selectedProducts.includes(productToDelete.name)) {
        setSelectedProducts(selectedProducts.filter(p => p !== productToDelete.name));
      }
      
      setSuccess('Продукт успешно удален');
      
      setTimeout(() => setSuccess(''), 3000);
      
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении продукта:', error);
      setError('Не удалось удалить продукт. Пожалуйста, попробуйте снова.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearchRecipes = async () => {
    if (selectedProducts.length === 0) {
      setError('Пожалуйста, выберите хотя бы один продукт');
      return;
    }
    
    try {
      setSearchLoading(true);
      setError('');
      const response = await axios.post('http://localhost:8080/search-recipes', selectedProducts, {
        withCredentials: true
      });
      setRecipes(response.data);
      
      if (response.data.length === 0) {
        setError('По выбранным продуктам не найдено рецептов');
      }
    } catch (error) {
      console.error('Ошибка при поиске рецептов:', error);
      setError('Не удалось выполнить поиск рецептов');
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleProductSelection = (product, event) => {
    if (event && event.target.closest('.delete-btn')) {
      return;
    }
    
    if (selectedProducts.includes(product.name)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== product.name));
    } else {
      setSelectedProducts([...selectedProducts, product.name]);
    }
  };

  const openDeleteConfirmModal = (product, event) => {
    if (event) {
      event.stopPropagation();
    }
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const getFileSizeString = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const openAddProductModal = () => {
    setError('');
    setProductName('');
    setProductNumber('');
    setProductImage(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    setError('');
  };

  return (
    <Container fluid className="px-0">
      <Row className="m-0 py-3 border-bottom shadow-sm" style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 1000 
      }}>
        <Col xs={12} className="d-flex align-items-center">
          <h1 className="m-0">
            <Link to="/" className="text-decoration-none">
              <span style={{ color: '#2E8B57', fontWeight: 'bold' }}>Nutri</span>
              <span style={{ color: '#4682B4', fontWeight: 'bold' }}>Mind</span>
            </Link>
          </h1>
        </Col>
      </Row>

      <Row className="m-0">
        <Col xs={12} md={3} lg={2} className="p-0 border-end shadow-sm" style={{ 
          minHeight: 'calc(100vh - 60px)', 
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f9fa',
          position: 'sticky',
          top: '60px',
          height: 'calc(100vh - 60px)',
          overflowY: 'auto'
        }}>
          <Nav className="flex-column py-4">
            <Nav.Link as={Link} to="/" className="ps-4 py-3" style={{
              borderLeft: '4px solid transparent'
            }}>
              <i className="bi bi-house-door me-2"></i> Главная
            </Nav.Link>
            <Nav.Link as={Link} to="/recipes" className="ps-4 py-3" style={{
              borderLeft: '4px solid transparent'
            }}>
              <i className="bi bi-journal-text me-2"></i> Рецепты
            </Nav.Link>
            <Nav.Link as={Link} to="/profile" className="ps-4 py-3" style={{
              borderLeft: '4px solid transparent'
            }}>
              <i className="bi bi-person me-2"></i> Профиль
            </Nav.Link>
            <Nav.Link as={Link} to="/product-search" className="ps-4 py-3 active" style={{
              borderLeft: '4px solid #2E8B57',
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e9ecef'
            }}>
              <i className="bi bi-search me-2"></i> Поиск продуктов
            </Nav.Link>
            <Nav.Link as={Link} to="/settings" className="ps-4 py-3" style={{
              borderLeft: '4px solid transparent'
            }}>
              <i className="bi bi-gear me-2"></i> Настройки
            </Nav.Link>
          </Nav>
        </Col>

        <Col xs={12} md={9} lg={10} className="p-4">
          <Row className="mb-4 align-items-center">
            <Col>
              <h1 className="mb-0">Поиск рецептов по продуктам</h1>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                onClick={openAddProductModal}
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus-circle me-2"></i> Добавить продукт
              </Button>
            </Col>
          </Row>
          
          {success && <Alert variant="success" className="mb-4">{success}</Alert>}
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        
          <Row>
            <Col lg={12} className="mb-4">
              <Card 
                className="shadow-sm"
                style={{
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                  borderColor: theme === 'dark' ? '#444' : '#dee2e6',
                  color: theme === 'dark' ? '#fff' : '#212529'
                }}
              >
                <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Выберите продукты для поиска</h4>
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    Выбрано: {selectedProducts.length}
                  </Badge>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                      </Spinner>
                      <p className="mt-2">Загрузка продуктов...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <Alert variant="info">
                      Список продуктов пуст. Добавьте новые продукты, нажав кнопку "Добавить продукт".
                    </Alert>
                  ) : (
                    <ListGroup>
                      {products.map((product) => (
                        <ListGroup.Item 
                          key={product.id}
                          className="d-flex align-items-center justify-content-between py-3"
                          action
                          active={selectedProducts.includes(product.name)}
                          onClick={(e) => toggleProductSelection(product, e)}
                          style={{
                            backgroundColor: selectedProducts.includes(product.name) 
                              ? (theme === 'dark' ? '#375a7f' : '#d1e7dd') 
                              : (theme === 'dark' ? '#333' : '#fff'),
                            color: selectedProducts.includes(product.name) 
                              ? (theme === 'dark' ? '#fff' : '#0f5132') 
                              : (theme === 'dark' ? '#fff' : '#212529'),
                            border: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6',
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <Form.Check 
                              type="checkbox"
                              checked={selectedProducts.includes(product.name)}
                              onChange={() => {}}
                              className="me-3"
                            />
                            {product.image && (
                              <Image
                                src={`http://localhost:8080${product.image}`}
                                alt={product.name}
                                width={50}
                                height={50}
                                className="me-3 object-fit-cover rounded"
                              />
                            )}
                            <div>
                              <h5 className="mb-0">{product.name}</h5>
                              <small className="text-muted">{product.number}</small>
                            </div>
                          </div>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="delete-btn"
                            onClick={(e) => openDeleteConfirmModal(product, e)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
                <Card.Footer>
                  <div className="d-grid">
                    <Button 
                      variant="success" 
                      onClick={handleSearchRecipes}
                      disabled={selectedProducts.length === 0 || searchLoading}
                      size="lg"
                    >
                      {searchLoading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Поиск рецептов...
                        </>
                      ) : (
                        'Найти рецепты по выбранным продуктам'
                      )}
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
          
          <h2 className="mt-5 mb-4">Результаты поиска</h2>
          {recipes.length === 0 && !error && !searchLoading ? (
            <Alert variant="info">
              Выберите продукты и нажмите кнопку поиска, чтобы найти подходящие рецепты.
            </Alert>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {recipes.map((recipe) => (
                <Col key={recipe.id}>
                  <Card 
                    className="h-100 shadow-sm recipe-card"
                    onClick={() => history.push(`/recipes/${recipe.id}`)}
                    style={{
                      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                      borderColor: theme === 'dark' ? '#444' : '#dee2e6',
                      color: theme === 'dark' ? '#fff' : '#212529',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                  >
                    {recipe.image && (
                      <div className="position-relative" style={{ height: '180px', overflow: 'hidden' }}>
                        <Card.Img 
                          variant="top" 
                          src={`http://localhost:8080${recipe.image}`} 
                          alt={recipe.name}
                          className="object-fit-cover w-100 h-100"
                        />
                        <div 
                          className="position-absolute top-0 end-0 p-2 m-2 rounded" 
                          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                        >
                          <i className="bi bi-clock me-1"></i> {recipe.cooking_time} мин
                        </div>
                      </div>
                    )}
                    <Card.Body>
                      <Card.Title>{recipe.name}</Card.Title>
                      <Card.Text className="text-truncate">
                        {recipe.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-between align-items-center"
                      style={{
                        backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                        borderTop: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6',
                      }}
                    >
                      <small className="text-muted">
                        <i className="bi bi-fire me-1"></i> {recipe.calories} ккал
                      </small>
                      <small className="text-muted">
                        <i className="bi bi-people me-1"></i> {recipe.serving} порц.
                      </small>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        backdrop="static"
        size="lg"
        style={{
          color: theme === 'dark' ? '#fff' : '#212529'
        }}
      >
        <Modal.Header 
          closeButton
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
            borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6'
          }}
        >
          <Modal.Title>Добавить новый продукт</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff'
          }}
        >
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleAddProduct}>
            <Form.Group className="mb-3">
              <Form.Label>Название продукта</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите название продукта"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                style={{
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Количество/Единица измерения</Form.Label>
              <Form.Control
                type="text"
                placeholder="Например: 100г, 1 шт., 1 литр"
                value={productNumber}
                onChange={(e) => setProductNumber(e.target.value)}
                style={{
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Изображение продукта</Form.Label>
              <Form.Control
                id="formFile"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setProductImage(e.target.files[0])}
                style={{
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                }}
              />
              <Form.Text className="text-muted">
                {productImage && `Выбран файл: ${productImage.name} (${getFileSizeString(productImage.size)})`}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
            borderTop: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6'
          }}
        >
          <Button variant="secondary" onClick={closeModal}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddProduct}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Добавление...
              </>
            ) : (
              'Добавить продукт'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        centered
        backdrop="static"
        style={{
          color: theme === 'dark' ? '#fff' : '#212529'
        }}
      >
        <Modal.Header 
          closeButton
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
            borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6'
          }}
        >
          <Modal.Title>Удаление продукта</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff'
          }}
        >
          {productToDelete && (
            <p>Вы действительно хотите удалить продукт "{productToDelete.name}"?</p>
          )}
        </Modal.Body>
        <Modal.Footer
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
            borderTop: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6'
          }}
        >
          <Button variant="secondary" onClick={closeDeleteModal}>
            Отмена
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProduct}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Удаление...
              </>
            ) : (
              'Удалить'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .recipe-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default ProductSearchPage;