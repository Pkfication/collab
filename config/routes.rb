Rails.application.routes.draw do
  resources :whiteboards do
    resources :drawings, only: [ :create ]
  end

  get "up" => "rails/health#show", as: :rails_health_check
  root "whiteboards#index"
end
