require "test_helper"

class WhiteboardsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get whiteboards_index_url
    assert_response :success
  end

  test "should get show" do
    get whiteboards_show_url
    assert_response :success
  end

  test "should get new" do
    get whiteboards_new_url
    assert_response :success
  end

  test "should get create" do
    get whiteboards_create_url
    assert_response :success
  end
end
